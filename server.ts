import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Server in-memory and persistent file storage
const DATA_FILE = path.join(__dirname, 'server-schedule-data.json');

// Default initial state
interface ServerDataState {
  version: number;
  lastUpdated: string;
  schedules: any;
  announcements: any[];
  kioskSettings: any;
}

let serverState: ServerDataState = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  schedules: null,
  announcements: [],
  kioskSettings: null,
};

// Load saved data if available
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    serverState = JSON.parse(raw);
    console.log('[Server] Loaded persisted schedule data from disk. Version:', serverState.version);
  }
} catch (err) {
  console.warn('[Server] Could not load saved data, will initialize on first client connect');
}

function persistData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(serverState, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Server] Failed to write data file:', e);
  }
}

// SSE Clients for real-time synchronization
type SSEClient = {
  id: string;
  res: Response;
};

let sseClients: SSEClient[] = [];

function broadcastSSE(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

// REST API Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    version: serverState.version,
    clientsCount: sseClients.length,
  });
});

app.get('/api/sync', (req: Request, res: Response) => {
  res.json({
    version: serverState.version,
    lastUpdated: serverState.lastUpdated,
    schedules: serverState.schedules,
    announcements: serverState.announcements,
    kioskSettings: serverState.kioskSettings,
  });
});

app.post('/api/sync', (req: Request, res: Response) => {
  const { schedules, announcements, kioskSettings } = req.body;
  serverState.version += 1;
  serverState.lastUpdated = new Date().toISOString();
  if (schedules) serverState.schedules = schedules;
  if (announcements) serverState.announcements = announcements;
  if (kioskSettings) serverState.kioskSettings = kioskSettings;

  persistData();
  broadcastSSE('sync', {
    version: serverState.version,
    lastUpdated: serverState.lastUpdated,
    schedules: serverState.schedules,
    announcements: serverState.announcements,
    kioskSettings: serverState.kioskSettings,
  });

  res.json({ success: true, version: serverState.version });
});

app.post('/api/trigger-bell', (req: Request, res: Response) => {
  const { type = 'pesantren', message = 'Bel darurat / pengumuman manual dari server pusat' } = req.body;
  broadcastSSE('bell', { type, message, timestamp: new Date().toISOString() });
  res.json({ success: true, triggered: true });
});

// Server-Sent Events Endpoint for live multi-screen sync
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial connected payload
  res.write(`event: init\ndata: ${JSON.stringify({ clientId, version: serverState.version })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

import os from 'os';

function getLocalIPs(): string[] {
  const nets = os.networkInterfaces();
  const results: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if ((net.family === 'IPv4' || (net as any).family === 4) && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

// Vite Middleware integration
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('================================================================');
    console.log(`[IIQBS SERVER JADWAL SANTRI] Berhasil dijalankan di Port ${PORT}`);
    console.log(`> Komputer ini : http://localhost:${PORT}`);
    const ips = getLocalIPs();
    if (ips.length > 0) {
      console.log(`> Buka di Smart TV / Tablet (WiFi Pondok):`);
      ips.forEach((ip) => {
        console.log(`  👉 http://${ip}:${PORT}`);
      });
    } else {
      console.log(`> Buka di Smart TV menggunakan alamat IP komputer ini di port ${PORT}`);
    }
    console.log('================================================================');
  });
}

startServer();
