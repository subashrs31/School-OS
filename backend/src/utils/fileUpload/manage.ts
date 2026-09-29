import path from 'path';
import fs from 'fs';
import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3, getDriver } from './storage';
import env from '../../config/appConfig';
import logger from '../logger';
import { S3Value } from '../../types';

export const isS3Value = (v: unknown): v is S3Value =>
  v !== null && typeof v === 'object' && typeof (v as S3Value).s3_path === 'string';

export const isLocalValue = (v: unknown): v is string =>
  typeof v === 'string' && !v.startsWith('http');

export const accessUrl = async (stored: string | S3Value | null, { expiresIn = 300 } = {}): Promise<string | null> => {
  if (!stored) return null;
  if (isS3Value(stored)) {
    const { s3, bucket } = getS3();
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: stored.s3_path }), { expiresIn });
  }
  if (isLocalValue(stored)) {
    return `http://localhost:${env.PORT}/${env.FILE_UPLOAD_FOLDER}/${stored}`;
  }
  return stored as string;
};

export const deleteFile = async (stored: string | S3Value | null): Promise<void> => {
  if (!stored) return;
  try {
    if (isS3Value(stored)) {
      const { s3, bucket } = getS3();
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: stored.s3_path }));
      return;
    }
    if (isLocalValue(stored)) {
      const full = path.join(__dirname, '../../../public', env.FILE_UPLOAD_FOLDER, stored);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
  } catch (err) {
    logger.warn(`[fileUpload] deleteFile failed: ${(err as Error).message}`);
  }
};

export const deleteFolder = async (folder: string, driver: string | null = null): Promise<void> => {
  const resolved = driver ?? getDriver();
  try {
    if (resolved === 's3') {
      const { s3, bucket } = getS3();
      let continuationToken: string | undefined;
      do {
        const listRes = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${folder}/`, ContinuationToken: continuationToken }));
        const objects = (listRes.Contents ?? []).map(o => ({ Key: o.Key! }));
        if (objects.length) await s3.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects, Quiet: true } }));
        continuationToken = listRes.IsTruncated ? listRes.NextContinuationToken : undefined;
      } while (continuationToken);
      return;
    }
    const dir = path.join(__dirname, '../../../public', env.FILE_UPLOAD_FOLDER, folder);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    logger.warn(`[fileUpload] deleteFolder failed: ${(err as Error).message}`);
  }
};
