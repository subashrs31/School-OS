import dotenv from 'dotenv';
dotenv.config();

import env from './src/config/appConfig';
import app from './src/app';
import apiResponse from './src/helpers/apiResponse';
import bootstrap from './src/config/bootstrap';
import logger from './src/utils/logger';
import { Request, Response } from 'express';

if (!env) {
  logger.error('[Server] Config is invalid. Fix the errors above. Server will not start.');
} else {
  app.get('/', (_req: Request, res: Response) => {
    return apiResponse.success(res, 'API is up and running!');
  });

  app.listen(Number(env.PORT), () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    bootstrap();
  });
}
