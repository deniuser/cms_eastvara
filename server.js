const express = require('express');
const cors = require('cors');
const RouterOSAPI = require('routeros-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Store active connections
const connections = new Map();

// MikroTik API endpoints
app.post('/api/mikrotik/connect', async (req, res) => {
  const { host, username, password, port = 8728 } = req.body;
  
  try {
    const conn = new RouterOSAPI({
      host,
      user: username,
      password,
      port: parseInt(port),
      timeout: 10
    });

    await conn.connect();
    
    // Get system info to verify connection
    const systemResource = await conn.write('/system/resource/print');
    
    // Store connection for reuse
    const connectionId = `${host}:${port}`;
    connections.set(connectionId, conn);
    
    res.json({
      success: true,
      method: 'RouterOS API',
      systemInfo: systemResource[0] || {}
    });
    
  } catch (error) {
    console.error('MikroTik connection error:', error);
    res.json({
      success: false,
      error: error.message || 'Connection failed'
    });
  }
});

app.post('/api/mikrotik/system-resource', async (req, res) => {
  const { host, port = 8728 } = req.body;
  const connectionId = `${host}:${port}`;
  const conn = connections.get(connectionId);
  
  if (!conn) {
    return res.status(400).json({ error: 'Not connected. Please connect first.' });
  }
  
  try {
    const result = await conn.write('/system/resource/print');
    res.json(result[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mikrotik/interfaces', async (req, res) => {
  const { host, port = 8728 } = req.body;
  const connectionId = `${host}:${port}`;
  const conn = connections.get(connectionId);
  
  if (!conn) {
    return res.status(400).json({ error: 'Not connected. Please connect first.' });
  }
  
  try {
    const result = await conn.write('/interface/print');
    res.json(result || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mikrotik/hotspot-active', async (req, res) => {
  const { host, port = 8728 } = req.body;
  const connectionId = `${host}:${port}`;
  const conn = connections.get(connectionId);
  
  if (!conn) {
    return res.status(400).json({ error: 'Not connected. Please connect first.' });
  }
  
  try {
    const result = await conn.write('/ip/hotspot/active/print');
    res.json(result || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mikrotik/disconnect-user', async (req, res) => {
  const { host, port = 8728, userId } = req.body;
  const connectionId = `${host}:${port}`;
  const conn = connections.get(connectionId);
  
  if (!conn) {
    return res.status(400).json({ error: 'Not connected. Please connect first.' });
  }
  
  try {
    await conn.write('/ip/hotspot/active/remove', [`=numbers=${userId}`]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cleanup connections on exit
process.on('SIGINT', () => {
  console.log('Closing MikroTik connections...');
  connections.forEach(conn => {
    try {
      conn.close();
    } catch (e) {
      // Ignore errors during cleanup
    }
  });
  process.exit(0);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/mikrotik/*`);
});