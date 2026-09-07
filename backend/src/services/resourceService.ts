import { randomUUID, createHash } from 'crypto';
import { writeFile, readFile, unlink } from 'fs/promises';
import {
  resourceModel,
  toApiResource,
  toApiResourceFile,
  toApiResourceListItem,
  type ResourceRow,
} from '../models/resourceModel';
import { auditLogModel } from '../models/auditLogModel';
import { getStorageAdapter } from '../config/config/storage';
import { detectFileType, isAllowedMimeType } from '../utils/fileSniffer';
import { resolveStoragePath, sanitizeFilenameForHeader } from '../utils/storagePaths';
import { env } from '../config/config/env';
import { AppError } from '../types/errors';

interface ActorContext {
  actorUserId: string;
  actorRole: 'USER' | 'ADMIN';
  requestId?: string;
  ipAddress?: string;
}

/**
 * The first ownership-check precedent in this codebase (taxonomy is
 * role-only via `authorize('ADMIN')`). Two-gate rule, applied
 * identically everywhere a resource/file is looked up:
 *
 *   1. Visibility — is this resource visible to the requester at all?
 *      Fails -> 404 (never reveal that someone else's non-public
 *      resource exists).
 *   2. Ownership — only reached once visible. Fails -> 403.
 */
function isVisible(resource: ResourceRow, ctx: ActorContext): boolean {
  return resource.status === 'READY' || ctx.actorRole === 'ADMIN' || resource.owner_id === ctx.actorUserId;
}

function isOwnerOrAdmin(resource: ResourceRow, ctx: ActorContext): boolean {
  return resource.owner_id === ctx.actorUserId || ctx.actorRole === 'ADMIN';
}

async function getVisibleOrThrow(id: string, ctx: ActorContext): Promise<ResourceRow> {
  const resource = await resourceModel.findById(id);
  if (!resource || !isVisible(resource, ctx)) {
    throw AppError.notFound('Resource not found.');
  }
  return resource;
}

/**
 * Stub seam for a future real antivirus/content-scan integration.
 * Always resolves 'clean' today — this is deliberately named and
 * isolated so a real scanner is a one-function swap, not a rewrite of
 * the confirm flow around it.
 */
async function scanStub(_buffer: Buffer): Promise<'clean' | 'flagged'> {
  return 'clean';
}

export const resourceService = {
  async createUploadIntent(
    input: {
      title: string;
      description?: string;
      universityId?: string;
      facultyId?: string;
      programmeId?: string;
      subjectId?: string;
      fileName: string;
      contentType: string;
      sizeBytes: number;
    },
    ctx: ActorContext,
  ) {
    if (!isAllowedMimeType(input.contentType)) {
      throw AppError.badRequest('Unsupported file type. Allowed: PDF, JPEG, PNG.');
    }
    if (input.sizeBytes > env.resources.maxFileSizeBytes) {
      throw AppError.badRequest(
        `File is too large. Maximum size is ${Math.floor(env.resources.maxFileSizeBytes / (1024 * 1024))}MB.`,
      );
    }

    const resource = await resourceModel.create({
      ownerId: ctx.actorUserId,
      title: input.title,
      description: input.description ?? null,
      universityId: input.universityId ?? null,
      facultyId: input.facultyId ?? null,
      programmeId: input.programmeId ?? null,
      subjectId: input.subjectId ?? null,
    });

    const storageKey = randomUUID();
    const file = await resourceModel.files.create({
      resourceId: resource.id,
      storageKey,
      originalFilename: input.fileName,
      declaredMimeType: input.contentType,
      sizeBytes: input.sizeBytes,
    });

    const { uploadUrl } = await getStorageAdapter().createUploadIntent(storageKey, input.contentType);

    await auditLogModel.record({
      actorUserId: ctx.actorUserId,
      action: 'RESOURCE_CREATED',
      targetType: 'resource',
      targetId: resource.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
    });

    return {
      resource: toApiResource(resource),
      file: toApiResourceFile(file),
      uploadUrl,
    };
  },

  /**
   * Handles the token-gated PUT — receives the raw file buffer already
   * validated for size by multer's `limits.fileSize`. Order matters:
   * detect the real type from bytes BEFORE writing anything to disk,
   * and only claim the DB row (atomic, one-shot) after that check
   * passes, so a rejected upload never leaves a partial/inconsistent
   * UPLOADED row behind.
   */
  async receiveUpload(storageKey: string, buffer: Buffer) {
    const detected = detectFileType(buffer);
    if (!detected) {
      throw AppError.badRequest('The uploaded file does not match any supported file type (PDF, JPEG, PNG).');
    }

    const checksum = createHash('sha256').update(buffer).digest('hex');
    const file = await resourceModel.files.claimForUpload(storageKey, {
      detectedMimeType: detected,
      checksumSha256: checksum,
    });
    if (!file) {
      throw AppError.conflict('This upload link has already been used or is no longer valid.');
    }

    if (file.declared_mime_type !== detected) {
      await resourceModel.files.markFailed(file.id);
      throw AppError.badRequest(
        'The file content does not match the declared file type. This upload has been rejected.',
      );
    }

    await writeFile(resolveStoragePath(storageKey), buffer);
    return toApiResourceFile(file);
  },

  async confirmUpload(fileId: string, ctx: ActorContext) {
    const file = await resourceModel.files.findById(fileId);
    if (!file) throw AppError.notFound('File not found.');

    const resource = await getVisibleOrThrow(file.resource_id, ctx);
    if (!isOwnerOrAdmin(resource, ctx)) throw AppError.forbidden();

    if (file.status !== 'UPLOADED') {
      throw AppError.conflict('This file has not finished uploading yet.');
    }

    const buffer = await readFile(resolveStoragePath(file.storage_key));
    const scanResult = await scanStub(buffer);

    const updatedFile =
      scanResult === 'clean' ? await resourceModel.files.markReady(fileId) : await resourceModel.files.markFailed(fileId);

    await auditLogModel.record({
      actorUserId: ctx.actorUserId,
      action: 'RESOURCE_FILE_CONFIRMED',
      targetType: 'resource_file',
      targetId: fileId,
      metadata: { scanResult },
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
    });

    const newResourceStatus = scanResult === 'clean' ? 'READY' : 'FAILED';
    const updatedResource = await resourceModel.setStatus(resource.id, newResourceStatus);
    await auditLogModel.record({
      actorUserId: ctx.actorUserId,
      action: newResourceStatus === 'READY' ? 'RESOURCE_READY' : 'RESOURCE_FAILED',
      targetType: 'resource',
      targetId: resource.id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
    });

    return {
      resource: toApiResource(updatedResource!),
      file: toApiResourceFile(updatedFile!),
    };
  },

  async getById(id: string, ctx: ActorContext) {
    const resource = await getVisibleOrThrow(id, ctx);
    const files = await resourceModel.files.findByResourceId(id);
    return { resource: toApiResource(resource), files: files.map(toApiResourceFile) };
  },

  async list(
    filters: {
      mine?: boolean;
      universityId?: string;
      facultyId?: string;
      programmeId?: string;
      subjectId?: string;
      page: number;
      pageSize: number;
    },
    ctx: ActorContext,
  ) {
    const limit = filters.pageSize;
    const offset = (filters.page - 1) * filters.pageSize;

    const { rows, total } = await resourceModel.list({
      status: filters.mine ? undefined : 'READY',
      ownerId: filters.mine ? ctx.actorUserId : undefined,
      universityId: filters.universityId,
      facultyId: filters.facultyId,
      programmeId: filters.programmeId,
      subjectId: filters.subjectId,
      limit,
      offset,
    });

    return {
      data: rows.map(toApiResourceListItem),
      meta: { page: filters.page, pageSize: filters.pageSize, total },
    };
  },

  async update(
    id: string,
    input: {
      title: string;
      description?: string;
      universityId?: string;
      facultyId?: string;
      programmeId?: string;
      subjectId?: string;
    },
    ctx: ActorContext,
  ) {
    const resource = await getVisibleOrThrow(id, ctx);
    if (!isOwnerOrAdmin(resource, ctx)) throw AppError.forbidden();

    const updated = await resourceModel.update(id, {
      title: input.title,
      description: input.description ?? null,
      universityId: input.universityId ?? null,
      facultyId: input.facultyId ?? null,
      programmeId: input.programmeId ?? null,
      subjectId: input.subjectId ?? null,
    });
    if (!updated) throw AppError.notFound('Resource not found.');

    await auditLogModel.record({
      actorUserId: ctx.actorUserId,
      action: 'RESOURCE_UPDATED',
      targetType: 'resource',
      targetId: id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
    });
    return toApiResource(updated);
  },

  async setStatus(id: string, action: 'ARCHIVE' | 'RESTORE', ctx: ActorContext) {
    const resource = await getVisibleOrThrow(id, ctx);
    if (!isOwnerOrAdmin(resource, ctx)) throw AppError.forbidden();

    const nextStatus = action === 'ARCHIVE' ? 'ARCHIVED' : 'READY';
    const updated = await resourceModel.setStatus(id, nextStatus);
    if (!updated) throw AppError.notFound('Resource not found.');

    await auditLogModel.record({
      actorUserId: ctx.actorUserId,
      action: action === 'ARCHIVE' ? 'RESOURCE_ARCHIVED' : 'RESOURCE_RESTORED',
      targetType: 'resource',
      targetId: id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
    });
    return toApiResource(updated);
  },

  /**
   * Real, irreversible delete — the one deliberate exception to this
   * app's archive-only convention elsewhere (taxonomy, and setStatus
   * above), added on top of Archive at the user's explicit request.
   * `resource_files` rows cascade automatically; the physical files on
   * disk don't, so those are cleaned up here, best-effort — a stray
   * orphaned file on disk is a much smaller problem than failing the
   * whole delete because one unlink hit a transient error.
   */
  async remove(id: string, ctx: ActorContext) {
    const resource = await getVisibleOrThrow(id, ctx);
    if (!isOwnerOrAdmin(resource, ctx)) throw AppError.forbidden();

    const files = await resourceModel.files.findByResourceId(id);
    const removed = await resourceModel.remove(id);
    if (!removed) throw AppError.notFound('Resource not found.');

    await Promise.all(
      files.map((file) =>
        unlink(resolveStoragePath(file.storage_key)).catch(() => {
          // Already gone, or never finished uploading — fine either way.
        }),
      ),
    );

    await auditLogModel.record({
      actorUserId: ctx.actorUserId,
      action: 'RESOURCE_DELETED',
      targetType: 'resource',
      targetId: id,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
    });
  },

  async getDownloadUrl(fileId: string, ctx: ActorContext) {
    const file = await resourceModel.files.findById(fileId);
    if (!file) throw AppError.notFound('File not found.');

    // Same visibility gate as any other resource read — never trust a
    // fileId alone to imply permission.
    await getVisibleOrThrow(file.resource_id, ctx);
    if (file.status !== 'READY') throw AppError.notFound('File not found.');

    const url = await getStorageAdapter().createSignedDownloadUrl(
      file.storage_key,
      env.resources.downloadTokenTtlSeconds,
    );
    return { url };
  },

  /**
   * Resolves what the token-gated download route needs: the on-disk
   * path plus response headers. The download token itself already
   * proved permission at the point `getDownloadUrl` issued it — this
   * step only needs to confirm the file still exists and is READY
   * (e.g. it wasn't archived/re-scanned-and-failed after the link was
   * handed out), it does not re-run the ownership/visibility gate.
   */
  async resolveDownload(storageKey: string) {
    const file = await resourceModel.files.findByStorageKey(storageKey);
    if (!file || file.status !== 'READY') {
      throw AppError.notFound('File not found.');
    }
    return {
      path: resolveStoragePath(storageKey),
      mimeType: file.detected_mime_type ?? file.declared_mime_type,
      filename: sanitizeFilenameForHeader(file.original_filename),
    };
  },
};
