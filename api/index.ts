import express from 'express';
import cors from 'cors';
import { apiRouter } from '../backend/routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
