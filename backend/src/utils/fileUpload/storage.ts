import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import env from '../../config/appConfig';
import s3Config from '../../config/s3Config';

const FILE_SIZE_LIMIT = env.FILE_SIZE_LIMIT;

export const getDriver = (): 's3' | 'local' => {
  const types = env?.STORAGE_TYPE;
  return Array.isArray(types) && types.includes('s3') ? 's3' : 'local';
};

export const getS3 = (): { s3: S3Client; bucket: string } => {
  const { s3, bucket } = s3Config;
  if (!s3 || !bucket) throw new Error('S3 is not configured. Check AWS_* env variables.');
  return { s3, bucket };
};

const BLOCKED_MIME_TYPES = [
  'application/x-msdownload', 'application/x-executable', 'application/x-sh',
  'application/x-php', 'text/x-php', 'application/x-httpd-php',
  'application/x-perl', 'application/x-python', 'text/x-python',
];

export const createParser = (options: { maxSize?: number } = {}): multer.Multer =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: options.maxSize ?? FILE_SIZE_LIMIT },
    fileFilter: (_req, file, cb) => {
      if (BLOCKED_MIME_TYPES.includes(file.mimetype)) {
        return cb(Object.assign(new Error(`File type not allowed: ${file.mimetype}`), { statusCode: 400 }));
      }
      cb(null, true);
    },
  });
