// MikroTik RouterOS API Client
export interface MikroTikConfig {
  host: string;
  username: string;
  password: string;
  port?: number;
  timeout?: number;
}

export interface MikroTikConnection {
  isConnected: boolean;
  lastError?: string;
  systemInfo?: {
    identity: string;
    version: string;
    uptime: string;
    cpuLoad: number;
    freeMemory: number;
    totalMemory: number;
  };
}

class MikroTikAPI {
  private config: MikroTikConfig | null = null;
  private connection: MikroTikConnection = { isConnected: false };

  // Set configuration
  setConfig(config: MikroTikConfig) {
    this.config = config;
    // Save to localStorage for persistence
    localStorage.setItem('mikrotik_config', JSON.stringify(config));
  }

  // Load configuration from localStorage
  loadConfig(): MikroTikConfig | null {
    const saved = localStorage.getItem('mikrotik_config');
    if (saved) {
      this.config = JSON.parse(saved);
      return this.config;
    }
    return null;
  }

  // Test connection to MikroTik router
  async testConnection(config?: MikroTikConfig): Promise<{ success: boolean; error?: string; systemInfo?: any }> {
    const testConfig = config || this.config;
    if (!testConfig) {
      return { success: false, error: 'No configuration provided' };
    }

    try {
      // Since we're in a browser environment, we need to use a proxy or CORS-enabled endpoint
      // For now, we'll simulate the connection test with validation
      
      // Validate IP address format
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(testConfig.host)) {
        return { success: false, error: 'Invalid IP address format' };
      }

      // Validate credentials
      if (!testConfig.username || !testConfig.password) {
        return { success: false, error: 'Username and password are required' };
      }

      // In a real implementation, you would need:
      // 1. A backend proxy server to handle MikroTik API calls
      // 2. Or use WebSocket connection to RouterOS API
      // 3. Or use MikroTik's REST API if available

      // For demonstration, we'll simulate a successful connection
      const mockSystemInfo = {
        identity: 'MikroTik-Router',
        version: '7.6',
        uptime: '10d 5h 30m',
        cpuLoad: Math.floor(Math.random() * 30) + 10,
        freeMemory: Math.floor(Math.random() * 200) + 100,
        totalMemory: 512
      };

      this.connection = {
        isConnected: true,
        systemInfo: mockSystemInfo
      };

      return { 
        success: true, 
        systemInfo: mockSystemInfo 
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      this.connection = {
        isConnected: false,
        lastError: errorMessage
      };
      return { success: false, error: errorMessage };
    }
  }

  // Get current connection status
  getConnectionStatus(): MikroTikConnection {
    return this.connection;
  }

  // Get system resources
  async getSystemResources(): Promise<any> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to MikroTik router');
    }

    // Mock system resources - in real implementation, this would query /system/resource
    return {
      uptime: this.connection.systemInfo?.uptime || '0s',
      version: this.connection.systemInfo?.version || 'Unknown',
      cpuLoad: this.connection.systemInfo?.cpuLoad || 0,
      freeMemory: this.connection.systemInfo?.freeMemory || 0,
      totalMemory: this.connection.systemInfo?.totalMemory || 0,
      architecture: 'arm64',
      boardName: 'hAP ac²'
    };
  }

  // Get interfaces
  async getInterfaces(): Promise<any[]> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to MikroTik router');
    }

    // Mock interfaces - in real implementation, this would query /interface
    return [
      {
        name: 'ether1',
        type: 'ether',
        running: true,
        disabled: false,
        rxByte: Math.floor(Math.random() * 1000000000),
        txByte: Math.floor(Math.random() * 500000000),
        rxPacket: Math.floor(Math.random() * 1000000),
        txPacket: Math.floor(Math.random() * 800000)
      },
      {
        name: 'wlan1',
        type: 'wlan',
        running: true,
        disabled: false,
        rxByte: Math.floor(Math.random() * 2000000000),
        txByte: Math.floor(Math.random() * 1000000000),
        rxPacket: Math.floor(Math.random() * 2000000),
        txPacket: Math.floor(Math.random() * 1600000)
      }
    ];
  }

  // Get hotspot users
  async getHotspotUsers(): Promise<any[]> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to MikroTik router');
    }

    // Mock hotspot users - in real implementation, this would query /ip/hotspot/active
    return [
      {
        user: 'user1',
        address: '192.168.1.100',
        macAddress: '00:11:22:33:44:55',
        uptime: '1h 30m',
        bytesIn: Math.floor(Math.random() * 100000000),
        bytesOut: Math.floor(Math.random() * 50000000)
      }
    ];
  }

  // Add hotspot user
  async addHotspotUser(username: string, password: string, profile?: string): Promise<boolean> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to MikroTik router');
    }

    // Mock user creation - in real implementation, this would use /ip/hotspot/user/add
    console.log(`Adding hotspot user: ${username} with profile: ${profile || 'default'}`);
    return true;
  }

  // Remove hotspot user
  async removeHotspotUser(username: string): Promise<boolean> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to MikroTik router');
    }

    // Mock user removal - in real implementation, this would use /ip/hotspot/user/remove
    console.log(`Removing hotspot user: ${username}`);
    return true;
  }

  // Disconnect active user
  async disconnectActiveUser(username: string): Promise<boolean> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to MikroTik router');
    }

    // Mock user disconnection - in real implementation, this would use /ip/hotspot/active/remove
    console.log(`Disconnecting active user: ${username}`);
    return true;
  }
}

export const mikrotikAPI = new MikroTikAPI();

// Helper function to format bytes
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to parse uptime
export const parseUptime = (uptime: string): number => {
  // Convert uptime string to seconds
  const parts = uptime.match(/(\d+)d|(\d+)h|(\d+)m|(\d+)s/g) || [];
  let seconds = 0;
  
  parts.forEach(part => {
    const value = parseInt(part);
    if (part.includes('d')) seconds += value * 24 * 60 * 60;
    else if (part.includes('h')) seconds += value * 60 * 60;
    else if (part.includes('m')) seconds += value * 60;
    else if (part.includes('s')) seconds += value;
  });
  
  return seconds;
};