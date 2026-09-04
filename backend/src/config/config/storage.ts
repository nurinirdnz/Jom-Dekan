import { env } from './env';

/**
 * Object storage adapter seam. Milestone 3 (secure resource files)
 * implements the real S3-compatible client (Supabase Storage / S3 / R2)
 * behind this interface. Nothing in Milestone 0/1 uploads files, so
 * only the contract and a clearly-labelled local stub live here —
 * enough for later milestones to implement against without churn.
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
        'Configure STORAGE_PROVIDER=s3 or supabase before implementing Milestone 3.',
    );
  }

  async createSignedDownloadUrl(): Promise<string> {
    throw new Error('STORAGE_NOT_CONFIGURED: no real object storage is wired up yet.');
  }
}

export function getStorageAdapter(): StorageAdapter {
  switch (env.storage.provider) {
    case 'local-stub':
    default:
      return new LocalStubStorageAdapter();
  }
}
