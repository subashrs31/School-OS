import path from 'path';
import fs from 'fs';

export const generateFileName = (originalName: string, { dir = null, storageType = 'local' }: { dir?: string | null; storageType?: string } = {}): string => {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

  if (storageType === 's3') {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return `${base}-${suffix}${ext}`;
  }

  let fileName = `${base}${ext}`;
  let counter = 1;
  while (dir && fs.existsSync(path.join(dir, fileName))) {
    fileName = `${base}_${counter}${ext}`;
    counter++;
  }
  return fileName;
};
