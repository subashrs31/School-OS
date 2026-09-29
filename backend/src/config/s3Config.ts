import { S3Client } from '@aws-sdk/client-s3';
import env from './appConfig';
import logger from '../utils/logger';

let s3: S3Client | null = null;

if (env?.STORAGE_TYPE?.includes('s3')) {
  const keys = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_BUCKET'] as const;
  const missing = keys.filter(k => !env[k]);
  if (missing.length) {
    logger.error(`[S3] Missing config: ${missing.join(', ')} — S3 disabled.`);
  } else {
    s3 = new S3Client({
      region: env.AWS_REGION!,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    logger.info('[S3] Client initialized');
  }
}

export default { s3, bucket: env?.AWS_BUCKET };
