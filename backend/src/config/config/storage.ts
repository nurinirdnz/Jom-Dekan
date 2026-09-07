import { mkdirSync } from 'fs';
import jwt from 'jsonwebtoken';
import { env } from './env';

/**
 * Object storage adapter seam. Milestone 3 (secure resource files)
 * implements a real local-filesystem client behind this interface for
 * dev use (no cloud account configured for this project); a real
 * S3-compatible client (Supabase Storage / S3 / R2) is a later drop-in
 * swap behind the same interface, unchanged.
 */
export interface StorageAdapter {
  readonly provider: string;
  createUploadIntent(_key: string, _contentType: string): Promise<{ uploadUrl: string; key: string }>;
  createSignedDownloadUrl(_key: string, _expiresInSeconds: number): Promise<string>;
}

class LocalStubStorageAdapter implements StorageAdapter {
  readonly provider = 'local-stub';

  async createUploadIntent(): Promise<{ uploadUrl: string; key: string }> {
    throw new Error(
      'STORAGE_NOT_CONFIGURED: local-stub storage cannot issue real upload intents. ' +
        'Set STORAGE_PROVIDER=local-fs for local dev, or s3/supabase in production.',
    );
  }

  async createSignedDownloadUrl(): Promise<string> {
    throw new Error('STORAGE_NOT_CONFIGURED: no real object storage is wired up yet.');
  }
}

interface StorageTokenPayload {
  key: string;
  purpose: 'upload' | 'download';
}

/**
 * Dev-only storage backend: files live on the local filesystem under
 * STORAGE_LOCAL_ROOT. Upload/download URLs are routes on this same app
 * gated by a short-lived signed token (see storageTokenMiddleware),
 * mirroring the shape of a real S3 presigned URL closely enough that
 * swapping in a real S3Adapter later requires no caller-side changes —
 * only this class and getStorageAdapter()'s switch change.
 */
class LocalFsStorageAdapter implements StorageAdapter {
  readonly provider = 'local-fs';

  constructor() {
    mkdirSync(env.storage.localRoot, { recursive: true });
  }

  async createUploadIntent(key: string, contentType: string): Promise<{ uploadUrl: string; key: string }> {
    const token = jwt.sign(
      { key, contentType, purpose: 'upload' } satisfies StorageTokenPayload & { contentType: string },
      env.storage.signingSecret,
      { expiresIn: env.resources.uploadTokenTtlSeconds, algorithm: 'HS256' },
    );
    return { uploadUrl: `/api/v1/resources/files/upload?token=${token}`, key };
  }

  async createSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string> {
    const token = jwt.sign({ key, purpose: 'download' } satisfies StorageTokenPayload, env.storage.signingSecret, {
      expiresIn: expiresInSeconds,
      algorithm: 'HS256',
    });
    return `/api/v1/resources/files/download?token=${token}`;
  }
}

export function verifyStorageToken(token: string, expectedPurpose: 'upload' | 'download'): { key: string } {
  const decoded = jwt.verify(token, env.storage.signingSecret, { algorithms: ['HS256'] }) as StorageTokenPayload;
  if (decoded.purpose !== expectedPurpose) {
    throw new Error('STORAGE_TOKEN_WRONG_PURPOSE');
  }
  return { key: decoded.key };
}

export function getStorageAdapter(): StorageAdapter {
  switch (env.storage.provider) {
    case 'local-fs':
      return new LocalFsStorageAdapter();
    case 'local-stub':
    default:
      return new LocalStubStorageAdapter();
  }
}
