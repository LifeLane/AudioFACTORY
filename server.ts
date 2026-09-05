/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Full-Stack Server
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './backend/routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request logger for diagnostic tracing
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Mount API routes first
  app.use('/api', apiRouter);

  // Serve dedicated marketing website at /website and /marketing
  const websitePath = path.join(process.cwd(), 'website');
  app.use('/website', express.static(websitePath));
  app.get('/marketing', (_req, res) => {
    res.sendFile(path.join(websitePath, 'index.html'));
  });

  // Vite middleware in dev / static serve in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AudioFACTORY Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
