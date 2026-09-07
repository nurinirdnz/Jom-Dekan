import { Router } from 'express';
import multer from 'multer';
import { resourceController } from '../controllers/resourceController';
import { validate } from '../config/middleware/validateMiddleware';
import { authenticate } from '../config/middleware/authMiddleware';
import { verifyStorageTokenMiddleware } from '../config/middleware/storageTokenMiddleware';
import { idParamSchema } from '../validators/taxonomyValidators';
import { env } from '../config/config/env';
import {
  createUploadIntentSchema,
  updateResourceSchema,
  resourceStatusActionSchema,
  listResourcesQuerySchema,
  fileIdParamSchema,
} from '../validators/resourceValidators';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.resources.maxFileSizeBytes },
});

/**
 * The two /files/upload and /files/download routes are deliberately
 * NOT keyed by :fileId in the path — the signed token carries only an
 * opaque storage key (never a fileId, which the storage adapter has no
 * business knowing about), mirroring how a real S3 presigned URL would
 * be shaped. Every other route below is a normal authenticated
 * app-level route and stays :fileId-keyed.
 */

/**
 * @openapi
 * /resources/upload-intent:
 *   post:
 *     tags: [Resources]
 *     summary: Create a resource + start an upload (returns a one-shot upload URL)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Upload intent created }
 */
router.post(
  '/upload-intent',
  authenticate,
  validate({ body: createUploadIntentSchema }),
  resourceController.createUploadIntent,
);

/**
 * @openapi
 * /resources/files/upload:
 *   put:
 *     tags: [Resources]
 *     summary: Upload the file bytes for a pending upload intent (token + auth required)
 *     responses:
 *       200: { description: File uploaded }
 *       401: { description: Invalid or expired link }
 */
router.put(
  '/files/upload',
  verifyStorageTokenMiddleware('upload'),
  // Also require a normal session, not just the token: unlike a real S3
  // presigned PUT (issued to a client with no app session), our SPA
  // already holds a bearer token at upload time — this closes the
  // window where a leaked/logged upload URL alone would be sufficient.
  authenticate,
  upload.single('file'),
  resourceController.receiveUpload,
);

/**
 * @openapi
 * /resources/files/{fileId}/confirm:
 *   post:
 *     tags: [Resources]
 *     summary: Confirm an uploaded file, running the scan-stub and flipping it to READY
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Upload confirmed }
 */
router.post(
  '/files/:fileId/confirm',
  authenticate,
  validate({ params: fileIdParamSchema }),
  resourceController.confirmUpload,
);

/**
 * @openapi
 * /resources:
 *   get:
 *     tags: [Resources]
 *     summary: Browse READY resources (or your own, via ?mine=true), with taxonomy filters
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of resources }
 */
router.get('/', authenticate, validate({ query: listResourcesQuerySchema }), resourceController.list);

/**
 * @openapi
 * /resources/{id}:
 *   get:
 *     tags: [Resources]
 *     summary: Get a resource by id (visible if READY, or you're the owner/ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Resource detail }
 *       404: { description: Not found or not visible }
 *   put:
 *     tags: [Resources]
 *     summary: Update resource metadata (owner or ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Resource updated }
 *       403: { description: Not the owner }
 */
router.get('/:id', authenticate, validate({ params: idParamSchema }), resourceController.getById);
router.put(
  '/:id',
  authenticate,
  validate({ params: idParamSchema, body: updateResourceSchema }),
  resourceController.update,
);

/**
 * @openapi
 * /resources/{id}:
 *   delete:
 *     tags: [Resources]
 *     summary: Permanently delete a resource and its file (owner or ADMIN only) — irreversible
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Resource deleted }
 *       403: { description: Not the owner }
 *       404: { description: Not found or not visible }
 */
router.delete('/:id', authenticate, validate({ params: idParamSchema }), resourceController.remove);

/**
 * @openapi
 * /resources/{id}/status:
 *   patch:
 *     tags: [Resources]
 *     summary: Archive or restore a resource (owner or ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Status updated }
 */
router.patch(
  '/:id/status',
  authenticate,
  validate({ params: idParamSchema, body: resourceStatusActionSchema }),
  resourceController.setStatus,
);

/**
 * @openapi
 * /resources/files/{fileId}/download-url:
 *   get:
 *     tags: [Resources]
 *     summary: Get a short-lived signed download URL (permission checked here, not at download time)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Signed download URL }
 */
router.get(
  '/files/:fileId/download-url',
  authenticate,
  validate({ params: fileIdParamSchema }),
  resourceController.getDownloadUrl,
);

/**
 * @openapi
 * /resources/files/download:
 *   get:
 *     tags: [Resources]
 *     summary: Download a file via a short-lived signed token (bare link, no auth header needed)
 *     responses:
 *       200: { description: File stream }
 *       401: { description: Invalid or expired link }
 */
router.get('/files/download', verifyStorageTokenMiddleware('download'), resourceController.download);

export default router;
