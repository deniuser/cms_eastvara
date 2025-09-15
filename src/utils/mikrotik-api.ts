// Real MikroTik RouterOS API Client
export interface RouterOSCommand {
  command: string;
  arguments?: Record<string, string>;
}

export interface RouterOSResponse {
  type: 'data' | 'done' | 'trap' | 'fatal';
  tag?: string;
  data?: Record<string, any>;
  message?: string;
}

export class RouterOSAPI {
  private ws: WebSocket | null = null;
  private connected = false;
  private host: string = '';
  private username: string = '';
  private password: string = '';
  private port: number = 8728;
  private useSecure: boolean = false;
  private callbacks: Map<string, (response: RouterOSResponse) => void> = new Map();
  private tagCounter = 0;

  constructor() {}

  async connect(host: string, username: string, password: string, port: number = 8728, useSecure: boolean = false): Promise<boolean> {
    this.host = host;
    this.username = username;
    this.password = password;
    this.port = port;
    this.useSecure = useSecure;

    try {
      // For browser environment, we need to use WebSocket connection to RouterOS
      // Note: This requires RouterOS to have WebSocket API enabled
      const protocol = useSecure ? 'wss' : 'ws';
      const wsPort = useSecure ? (port === 8728 ? 8729 : port) : (port === 8728 ? 8729 : port);
      const wsUrl = `${protocol}://${host}:${wsPort}`;
      
      this.ws = new WebSocket(wsUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Failed to create WebSocket connection'));
          return;
        }

        this.ws.onopen = async () => {
          try {
            // Authenticate with the router
            const loginResult = await this.login();
            this.connected = loginResult;
            resolve(loginResult);
          } catch (error) {
            reject(error);
          }
        };

        this.ws.onerror = (error) => {
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          this.connected = false;
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      throw new Error(`Connection failed: ${error}`);
    }
  }

  private async login(): Promise<boolean> {
    try {
      // Send login command
      const loginCommand: RouterOSCommand = {
        command: '/login',
        arguments: {
          name: this.username,
          password: this.password
        }
      };

      const response = await this.sendCommand(loginCommand);
      return response.type === 'done';
    } catch (error) {
      return false;
    }
  }

  private handleMessage(data: string) {
    try {
      const response: RouterOSResponse = JSON.parse(data);
      const callback = this.callbacks.get(response.tag || '');
      if (callback) {
        callback(response);
        if (response.type === 'done' || response.type === 'trap' || response.type === 'fatal') {
          this.callbacks.delete(response.tag || '');
        }
      }
    } catch (error) {
      console.error('Failed to parse RouterOS response:', error);
    }
  }

  private sendCommand(command: RouterOSCommand): Promise<RouterOSResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || !this.connected) {
        reject(new Error('Not connected to RouterOS'));
        return;
      }

      const tag = `tag${++this.tagCounter}`;
      
      const message = {
        command: command.command,
        tag: tag,
        ...command.arguments
      };

      this.callbacks.set(tag, (response) => {
        if (response.type === 'done') {
          resolve(response);
        } else if (response.type === 'trap' || response.type === 'fatal') {
          reject(new Error(response.message || 'Command failed'));
        }
      });

      this.ws.send(JSON.stringify(message));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.callbacks.has(tag)) {
          this.callbacks.delete(tag);
          reject(new Error('Command timeout'));
        }
      }, 30000);
    });
  }

  async getSystemResource(): Promise<any> {
    const response = await this.sendCommand({ command: '/system/resource/print' });
    return response.data;
  }

  async getInterfaces(): Promise<any[]> {
    const response = await this.sendCommand({ command: '/interface/print' });
    return Array.isArray(response.data) ? response.data : [response.data];
  }

  async getHotspotActive(): Promise<any[]> {
    const response = await this.sendCommand({ command: '/ip/hotspot/active/print' });
    return Array.isArray(response.data) ? response.data : [response.data];
  }

  async getHotspotUsers(): Promise<any[]> {
    const response = await this.sendCommand({ command: '/ip/hotspot/user/print' });
    return Array.isArray(response.data) ? response.data : [response.data];
  }

  async addHotspotUser(username: string, password: string, profile: string = 'default'): Promise<boolean> {
    try {
      await this.sendCommand({
        command: '/ip/hotspot/user/add',
        arguments: {
          name: username,
          password: password,
          profile: profile
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeHotspotUser(id: string): Promise<boolean> {
    try {
      await this.sendCommand({
        command: '/ip/hotspot/user/remove',
        arguments: {
          numbers: id
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async disconnectActiveUser(id: string): Promise<boolean> {
    try {
      await this.sendCommand({
        command: '/ip/hotspot/active/remove',
        arguments: {
          numbers: id
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.callbacks.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// HTTP API Alternative (for routers with REST API enabled)
export class RouterOSHTTPAPI {
  private baseUrl: string = '';
  private username: string = '';
  private password: string = '';
  private sessionId: string = '';

  constructor() {}

  async connect(host: string, username: string, password: string, port: number = 80, useHttps: boolean = false): Promise<boolean> {
    this.baseUrl = `${useHttps ? 'https' : 'http'}://${host}:${port}/rest`;
    this.username = username;
    this.password = password;

    try {
      // Test connection with a simple API call
      const response = await fetch(`${this.baseUrl}/system/resource`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Connection failed: ${error}`);
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getSystemResource(): Promise<any> {
    return this.makeRequest('/system/resource');
  }

  async getInterfaces(): Promise<any[]> {
    return this.makeRequest('/interface');
  }

  async getHotspotActive(): Promise<any[]> {
    return this.makeRequest('/ip/hotspot/active');
  }

  async getHotspotUsers(): Promise<any[]> {
    return this.makeRequest('/ip/hotspot/user');
  }

  async addHotspotUser(username: string, password: string, profile: string = 'default'): Promise<boolean> {
    try {
      await this.makeRequest('/ip/hotspot/user', 'POST', {
        name: username,
        password: password,
        profile: profile
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeHotspotUser(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/ip/hotspot/user/${id}`, 'DELETE');
      return true;
    } catch (error) {
      return false;
    }
  }

  async disconnectActiveUser(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/ip/hotspot/active/${id}`, 'DELETE');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Backend Proxy API Manager
export class MikroTikAPIManager {
  private connected = false;
  private config: {
    host: string;
    username: string;
    password: string;
    port: number;
  } | null = null;
  private baseUrl = window.location.origin;

  constructor() {
  }

  async connect(host: string, username: string, password: string, port?: number): Promise<{ success: boolean; method?: string; error?: string; systemInfo?: any }> {
    this.config = { host, username, password, port: port || 8728 };
    
    try {
      const response = await fetch(`${this.baseUrl}/api/mikrotik/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host,
          username,
          password,
          port: port || 8728
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.connected = true;
        return result;
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Backend connection failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async makeRequest(endpoint: string, data?: any): Promise<any> {
    if (!this.config) {
      throw new Error('Not connected. Please connect first.');
    }
    
    const response = await fetch(`${this.baseUrl}/api/mikrotik/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: this.config.host,
        port: this.config.port,
        ...data
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  }

  async getSystemResource(): Promise<any> {
    return this.makeRequest('system-resource');
  }

  async getInterfaces(): Promise<any[]> {
    return this.makeRequest('interfaces');
  }

  async getHotspotActive(): Promise<any[]> {
    return this.makeRequest('hotspot-active');
  }

  async disconnectActiveUser(id: string): Promise<boolean> {
    try {
      await this.makeRequest('disconnect-user', { userId: id });
      return true;
    } catch (error) {
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect() {
    this.connected = false;
    this.config = null;
  }

  getCurrentMethod(): string | null {
    return this.connected ? 'Backend Proxy API' : null;
  }

  saveConfig() {
    if (this.config) {
      localStorage.setItem('mikrotik_config', JSON.stringify(this.config));
    }
  }

  loadConfig(): boolean {
    const saved = localStorage.getItem('mikrotik_config');
    if (saved) {
      this.config = JSON.parse(saved);
      return true;
    }
    return false;
  }
}

export const mikrotikManager = new MikroTikAPIManager();