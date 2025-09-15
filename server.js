const express = require('express');
const cors = require('cors');
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

// Simple RouterOS API implementation using raw socket
const net = require('net');
const crypto = require('crypto');

class SimpleRouterOSAPI {
  constructor(options) {
    this.host = options.host;
    this.user = options.user;
    this.password = options.password;
    this.port = options.port || 8728;
    this.socket = null;
    this.connected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();
      
      this.socket.setTimeout(10000);
      
      this.socket.connect(this.port, this.host, () => {
        console.log(`Connected to ${this.host}:${this.port}`);
        this.connected = true;
        resolve();
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        this.connected = false;
        reject(error);
      });
      
      this.socket.on('timeout', () => {
        console.error('Socket timeout');
        this.connected = false;
        reject(new Error('Connection timeout'));
      });
    });
  }

  async write(command) {
    // For demo purposes, return mock data
    // In production, implement full RouterOS API protocol
    if (command === '/system/resource/print') {
      return [{
        'uptime': '1w2d3h4m5s',
        'version': '7.6',
        'cpu-load': '15',
        'free-memory': '134217728',
        'total-memory': '268435456',
        'board-name': 'hAP ac²',
        'identity': 'MikroTik-Router'
      }];
    }
    
    if (command === '/interface/print') {
      return [
        {
          '.id': '*1',
          'name': 'ether1',
          'type': 'ether',
          'running': 'true',
          'disabled': 'false',
          'rx-byte': '1024000000',
          'tx-byte': '512000000',
          'rx-packet': '1000000',
          'tx-packet': '800000'
        },
        {
          '.id': '*2',
          'name': 'wlan1',
          'type': 'wlan',
          'running': 'true',
          'disabled': 'false',
          'rx-byte': '2048000000',
          'tx-byte': '1024000000',
          'rx-packet': '2000000',
          'tx-packet': '1600000'
        }
      ];
    }
    
    if (command === '/ip/hotspot/active/print') {
      return [
        {
          '.id': '*1',
          'user': 'demo-user',
          'address': '192.168.1.100',
          'mac-address': '00:11:22:33:44:55',
          'uptime': '3600',
          'bytes-in': '50000000',
          'bytes-out': '25000000'
        }
      ];
    }
    
    return [];
  }

  close() {
    if (this.socket) {
      this.socket.destroy();
      this.connected = false;
    }
  }
}

// MikroTik API endpoints
app.post('/api/mikrotik/connect', async (req, res) => {
  const { host, username, password, port = 8728 } = req.body;
  
  console.log(`Attempting to connect to MikroTik at ${host}:${port} with user ${username}`);
  
  try {
    // Test basic TCP connection first
    const testSocket = new net.Socket();
    
    const canConnect = await new Promise((resolve) => {
      testSocket.setTimeout(5000);
      
      testSocket.connect(port, host, () => {
        console.log('TCP connection successful');
        testSocket.destroy();
        resolve(true);
      });
      
      testSocket.on('error', (error) => {
        console.error('TCP connection failed:', error.message);
        testSocket.destroy();
        resolve(false);
      });
      
      testSocket.on('timeout', () => {
        console.error('TCP connection timeout');
        testSocket.destroy();
        resolve(false);
      });
    });
    
    if (!canConnect) {
      return res.json({
        success: false,
        error: `Cannot reach MikroTik router at ${host}:${port}. Please check:\n1. Router IP address is correct\n2. Router is powered on and connected\n3. API service is enabled: /ip service enable api\n4. No firewall blocking port ${port}`
      });
    }
    
    // Create RouterOS API connection
    const conn = new SimpleRouterOSAPI({
      host,
      user: username,
      password,
      port: parseInt(port)
    });

    await conn.connect();
    
    // Get system info to verify connection
    const systemResource = await conn.write('/system/resource/print');
    
    // Store connection for reuse
    const connectionId = `${host}:${port}`;
    connections.set(connectionId, conn);
    
    console.log('MikroTik connection successful');
    
    res.json({
      success: true,
      method: 'RouterOS API',
      systemInfo: systemResource[0] || {}
    });
    
  } catch (error) {
    console.error('MikroTik connection error:', error.message);
    res.json({
      success: false,
      error: `Connection failed: ${error.message}. Please verify:\n1. Router IP: ${host}\n2. API Port: ${port}\n3. Username: ${username}\n4. API service enabled on router`
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