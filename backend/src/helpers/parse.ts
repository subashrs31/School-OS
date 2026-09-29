// Time units in milliseconds
const TIME_UNITS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

// Size units in bytes
const SIZE_UNITS: Record<string, number> = {
  b:  1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
};

/**
 * Parse a time expression to milliseconds.
 * Accepts: number (returned as-is), or string like '1s' '5m' '2h' '7d'
 * Examples: '1d' → 86400000, '15m' → 900000, 5000 → 5000
 */
export const parseExpireToMs = (expire: string | number): number => {
  if (typeof expire === 'number') return expire;
  const match = String(expire).match(/^(\d+(?:\.\d+)?)([smhd])$/i);
  if (!match) return 0;
  return parseFloat(match[1]) * (TIME_UNITS[match[2].toLowerCase()] ?? 1000);
};

/**
 * Parse a size expression to bytes.
 * Accepts: number (returned as-is), or string like '10mb' '1gb' '500kb' '1024b'
 * Examples: '10mb' → 10485760, '1gb' → 1073741824, 1024 → 1024
 */
export const parseSize = (size: string | number): number => {
  if (typeof size === 'number') return size;
  const match = String(size).match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)$/i);
  if (!match) return 0;
  return Math.floor(parseFloat(match[1]) * (SIZE_UNITS[match[2].toLowerCase()] ?? 1));
};
