import express, { type Express, type Request, type Response } from 'express';

/**
 * Builds the license-server HTTP app. LS-0 skeleton: health check and JSON 404.
 * The OIDC provider (LS-1), hosted pages (LS-2), admin API (LS-5) and admin UI (LS-7) mount here later.
 */
export const createApp = (): Express => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'license-server' });
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  return app;
};
