// src/utils/parseDuration.ts
export function parseDuration(input: string): number {
  const regex = /(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?/;
  const match = input.match(regex);
  if (!match) throw new Error(`Invalid duration format: ${input}`);

  const [, days, hours, minutes] = match.map(Number);
  const ms =
    (days || 0) * 86400_000 + (hours || 0) * 3600_000 + (minutes || 0) * 60_000;

  if (ms === 0) throw new Error(`Duration must be greater than 0: ${input}`);
  return ms;
}
