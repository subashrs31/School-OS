import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 4000);

createApp().listen(port, () => {
  // Single startup line; a structured logger arrives with LS-1.
  console.log(`[license-server] listening on http://localhost:${port}`);
});
