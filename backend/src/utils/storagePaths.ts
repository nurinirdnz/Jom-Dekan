import path from 'path';
import { env } from '../config/config/env';

const resolvedRoot = path.resolve(env.storage.localRoot);

/**
 * `key` is always a server-generated UUID (crypto.randomUUID()), never
 * derived from client input, so traversal via a crafted key is already
 * structurally impossible. This assertion is defense-in-depth only —
 * it should never actually trip.
 */
export function resolveStoragePath(key: string): string {
  const resolved = path.resolve(resolvedRoot, key);
  if (resolved !== resolvedRoot && !resolved.startsWith(resolvedRoot + path.sep)) {
    throw new Error(`Resolved storage path escapes STORAGE_LOCAL_ROOT: ${key}`);
  }
  return resolved;
}

/**
 * Original filenames are display metadata only, never used to build a
 * filesystem path — but they do land in the Content-Disposition
 * response header on download, so strip CR/LF (header injection) and
 * path separators (defense-in-depth, since some HTTP clients/proxies
 * are lenient about interpreting them).
 */
export function sanitizeFilenameForHeader(name: string): string {
  const stripped = name.replace(/[\r\n]/g, '').replace(/[/\\]/g, '_');
  return stripped.trim().slice(0, 200) || 'file';
}
