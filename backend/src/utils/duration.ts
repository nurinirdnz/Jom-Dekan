/** Parses simple duration strings like "15m", "30d", "1h" into milliseconds. */
export function parseDurationMs(input: string, fallback = '30d'): number {
  const match = /^(\d+)([smhd])$/.exec(input) ?? /^(\d+)([smhd])$/.exec(fallback)!;
  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
  return amount * multiplier;
}
