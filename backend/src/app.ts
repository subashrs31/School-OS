import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import routes from './routes/index';
import errorHandler from './middleware/error.middleware';
import notFound from './middleware/notFound.middleware';
import { connectDB } from './config/db';
import env from './config/appConfig';
import { globalLimiter, authLimiter, getCorsOptions } from './config/security';
import apiResponse from './helpers/apiResponse';
import logger from './utils/logger';
import { AppError } from './types';

const app = express();

if (!env.IS_LOCAL) app.set('trust proxy', 1);

connectDB().catch((err: Error) => {
  logger.error('Database connection failed:', err.message);
  process.exit(1);
});

app.use(cors(getCorsOptions(env.ALLOWED_ORIGINS)));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use(`/${env.FILE_UPLOAD_FOLDER}`, express.static(path.join(__dirname, '../public', env.FILE_UPLOAD_FOLDER)));
app.use(`/${env.FILE_UPLOAD_FOLDER}`, (_req: Request, res: Response) => res.status(404).end());

app.use((err: AppError, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && (err as AppError & { status?: number }).status === 400 && 'body' in err) {
    apiResponse.error(res, 'Invalid JSON format in request body', [err.message], 400);
    return;
  }
  next(err);
});

app.use(globalLimiter);
app.use(morgan(env.IS_LOCAL ? 'dev' : 'combined'));

app.use('/api/auth', authLimiter);
app.use('/api', routes);

if (env.IS_LOCAL || env.NODE_ENV !== 'prod') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.get('/', (_req: Request, res: Response) => apiResponse.success(res, 'Server is up and running!'));
app.use(notFound);
app.use(errorHandler);

export default app;
