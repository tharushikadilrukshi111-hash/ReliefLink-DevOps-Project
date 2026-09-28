import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { pingDatabase } from './db.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import incidentsRouter from './routes/incidents.js';
import inventoryRouter from './routes/inventory.js';
import volunteersRouter from './routes/volunteers.js';
import logsRouter from './routes/logs.js';
import actionsRouter from './routes/actions.js';
import unitsRouter from './routes/units.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const io = new SocketIOServer(server, { cors: { origin, credentials: true } });
app.set('io', io);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (_req, res) => {
  try { await pingDatabase(); res.json({ ok: true, database: 'connected', timestamp: new Date().toISOString() }); }
  catch (error) { res.status(503).json({ ok: false, database: 'disconnected', message: error.message }); }
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/field-logs', logsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/units', unitsRouter);

io.on('connection', socket => {
  socket.emit('system:hello', { connected: true, message: 'CrisisBridge realtime channel connected.' });
});

// If the frontend has been built, production mode can serve it from the same Node server.
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A record with that unique value already exists.' });
  res.status(500).json({ message: 'Internal server error.', detail: process.env.NODE_ENV === 'production' ? undefined : err.message });
});

const port = Number(process.env.PORT || 5000);
server.listen(port, async () => {
  console.log(`CrisisBridge API listening on http://localhost:${port}`);
  try { await pingDatabase(); console.log('MySQL: connected'); }
  catch (error) { console.error('MySQL: connection failed. Run npm run db:setup after starting MySQL.'); console.error(error.message); }
});
