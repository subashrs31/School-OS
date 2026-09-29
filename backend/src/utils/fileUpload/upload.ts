import path from 'path';
import fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getDriver, getS3, createParser } from './storage';
import { generateFileName } from './file';
import env from '../../config/appConfig';
import { S3Value } from '../../types';

interface AppRequestWithFiles extends Request {
  uploadedFiles?: Record<string, string | S3Value | Array<string | S3Value>>;
}

const persist = async (file: Express.Multer.File, folder: string, driver?: string): Promise<string | S3Value> => {
  const resolved = driver ?? getDriver();

  if (resolved === 's3') {
    const { s3, bucket } = getS3();
    const filename = generateFileName(file.originalname, { storageType: 's3' });
    const key = `${folder}/${filename}`;
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: file.buffer, ContentType: file.mimetype }));
    return { s3_path: key };
  }

  const dir = path.join(__dirname, '../../../public', env.FILE_UPLOAD_FOLDER, folder);
  fs.mkdirSync(dir, { recursive: true });
  const filename = generateFileName(file.originalname, { dir, storageType: 'local' });
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  return `${folder}/${filename}`;
};

export const uploadSingle = (fieldName = 'file', folder: string, options: { maxSize?: number; driver?: string } = {}): RequestHandler[] => [
  createParser(options).single(fieldName),
  async (req: AppRequestWithFiles, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.file) req.uploadedFiles = { [fieldName]: await persist(req.file, folder, options.driver) };
      next();
    } catch (err) { next(err); }
  },
];

export const uploadMultiple = (fields: Array<{ name: string; maxCount?: number }>, folder: string, options: { maxSize?: number; driver?: string } = {}): RequestHandler[] => [
  createParser(options).fields(fields),
  async (req: AppRequestWithFiles, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      if (files) {
        req.uploadedFiles = {};
        await Promise.all(
          Object.entries(files).map(async ([field, fileArr]) => {
            req.uploadedFiles![field] = await Promise.all(fileArr.map(f => persist(f, folder, options.driver)));
          })
        );
      }
      next();
    } catch (err) { next(err); }
  },
];
