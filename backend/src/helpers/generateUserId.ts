/**
 * Generates a meaningful user ID in the format USR00001, USR00002, etc.
 * Pass the current max numeric suffix to get the next one.
 * You can change the prefix or padding here later.
 */
const PREFIX = 'USR';
const PADDING = 5;

export const generateUserId = (sequence: number): string =>
  `${PREFIX}${String(sequence).padStart(PADDING, '0')}`;
