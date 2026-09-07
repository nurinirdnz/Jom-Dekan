/**
 * Content-based file type detection via magic bytes — never trust a
 * client-declared Content-Type or a filename extension. The allowlist
 * is deliberately small (PDF, JPEG, PNG — matching "PDFs, notes, past
 * papers, scanned pages") which also structurally rules out zip-bomb /
 * archive-based attacks, since none of the allowed types are archive
 * formats. Hand-rolled instead of the `file-type` npm package: that
 * package is pure ESM from v17+ and this backend is CommonJS
 * (ts-jest default), so pulling it in risks require() failures for no
 * real benefit given this fixed, tiny allowlist.
 */
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const SIGNATURES: Array<{ mimeType: AllowedMimeType; bytes: number[] }> = [
  { mimeType: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // "%PDF-"
  { mimeType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mimeType: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
];

function matches(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) return false;
  for (let i = 0; i < signature.length; i += 1) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

/** Returns the detected MIME type, or null if the bytes match nothing on the allowlist. */
export function detectFileType(buffer: Buffer): AllowedMimeType | null {
  for (const { mimeType, bytes } of SIGNATURES) {
    if (matches(buffer, bytes)) return mimeType;
  }
  return null;
}

export function isAllowedMimeType(value: string): value is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}
