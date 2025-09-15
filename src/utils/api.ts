import { User, AdminUser, PortalDesign, DeviceInfo, NetworkInterface, TrafficLog, Alert } from '../types';
import { mikrotikAPI } from './mikrotik';

// Mock data storage using localStorage
const STORAGE_KEYS = {
  USERS: 'hotspot_users',
  ADMIN_USERS: 'hotspot_admin_users',
  PORTAL_DESIGN: 'hotspot_portal_design',
  DEVICE_INFO: 'hotspot_device_info',
  INTERFACES: 'hotspot_interfaces',
  TRAFFIC_LOGS: 'hotspot_traffic_logs',
  ALERTS: 'hotspot_alerts',
  CURRENT_ADMIN: 'hotspot_current_admin'
};

// Initialize default data
const initializeData = () => {
  // Default admin users
  const defaultAdminUsers: AdminUser[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@mall.com',
      role: 'super_admin',
      createdAt: new Date(),
      isActive: true
    },
    {
      id: '2',
      username: 'marcom',
      email: 'marcom@mall.com',
      role: 'marcom',
      createdAt: new Date(),
      isActive: true
    },
    {
      id: '3',
      username: 'technician',
      email: 'tech@mall.com',
      role: 'technician',
      createdAt: new Date(),
      isActive: true
    }
  ];

  // Default portal design
  const defaultPortalDesign: PortalDesign = {
    id: '1',
    backgroundImage: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1600',
    logo: 'https://images.pexels.com/photos/6177/technology-computer-laptop-internet.jpg?auto=compress&cs=tinysrgb&w=100',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    welcomeText: 'Welcome to Mall WiFi',
    footerText: 'Enjoy your shopping experience',
    buttonText: 'Connect to Internet',
    redirectUrl: 'https://www.google.com',
    redirectDelay: 3,
    showCampaign: true,
    campaignTitle: 'Special Offer!',
    campaignDescription: 'Get 20% off on all items in our electronics store. Valid until end of month!',
    campaignImage: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    campaignButtonText: 'Shop Now',
    campaignButtonUrl: 'https://example-store.com/electronics',
    updatedAt: new Date(),
    updatedBy: 'admin'
  };

  // Default device info
  const defaultDeviceInfo: DeviceInfo = {
    id: '1',
    name: 'Mall-Router-01',
    model: 'hAP ac²',
    routerOSVersion: '7.6',
    uptime: 864000, // 10 days
    cpuUsage: 15,
    memoryUsage: 45,
    lastUpdated: new Date(),
    status: 'online'
  };

  // Default interfaces
  const defaultInterfaces: NetworkInterface[] = [
    {
      id: '1',
      name: 'ether1',
      type: 'ethernet',
      status: 'up',
      rxBytes: 1024000000,
      txBytes: 512000000,
      rxPackets: 1000000,
      txPackets: 800000,
      speed: '1Gbps',
      lastUpdated: new Date()
    },
    {
      id: '2',
      name: 'wlan1',
      type: 'wireless',
      status: 'up',
      rxBytes: 2048000000,
      txBytes: 1024000000,
      rxPackets: 2000000,
      txPackets: 1600000,
      speed: '300Mbps',
      lastUpdated: new Date()
    },
    {
      id: '3',
      name: 'bridge1',
      type: 'bridge',
      status: 'up',
      rxBytes: 3072000000,
      txBytes: 1536000000,
      rxPackets: 3000000,
      txPackets: 2400000,
      speed: '1Gbps',
      lastUpdated: new Date()
    }
  ];

  // Initialize localStorage if empty
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(defaultAdminUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PORTAL_DESIGN)) {
    localStorage.setItem(STORAGE_KEYS.PORTAL_DESIGN, JSON.stringify(defaultPortalDesign));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEVICE_INFO)) {
    localStorage.setItem(STORAGE_KEYS.DEVICE_INFO, JSON.stringify(defaultDeviceInfo));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INTERFACES)) {
    localStorage.setItem(STORAGE_KEYS.INTERFACES, JSON.stringify(defaultInterfaces));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRAFFIC_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.TRAFFIC_LOGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
  }
};

// Initialize data on module load
initializeData();

// Ensure admin users exist
const ensureAdminUsers = () => {
  const currentAdminUsers = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
  if (!currentAdminUsers || JSON.parse(currentAdminUsers).length === 0) {
    const defaultAdminUsers: AdminUser[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@mall.com',
        role: 'super_admin',
        createdAt: new Date(),
        isActive: true
      },
      {
        id: '2',
        username: 'marcom',
        email: 'marcom@mall.com',
        role: 'marcom',
        createdAt: new Date(),
        isActive: true
      },
      {
        id: '3',
        username: 'technician',
        email: 'tech@mall.com',
        role: 'technician',
        createdAt: new Date(),
        isActive: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(defaultAdminUsers));
  }
};

// Call this function to ensure admin users exist
ensureAdminUsers();

// Also ensure admin users exist when the page loads
if (typeof window !== 'undefined') {
  const defaultAdminUsers: AdminUser[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@mall.com',
      role: 'super_admin',
      createdAt: new Date(),
      isActive: true
    },
    {
      id: '2',
      username: 'marcom',
      email: 'marcom@mall.com',
      role: 'marcom',
      createdAt: new Date(),
      isActive: true
    },
    {
      id: '3',
      username: 'technician',
      email: 'tech@mall.com',
      role: 'technician',
      createdAt: new Date(),
      isActive: true
    }
  ];
  localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(defaultAdminUsers));
}

// API Functions
export const api = {
  // User management
  async createUser(userData: Omit<User, 'id' | 'connectionTime'>): Promise<User> {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      connectionTime: new Date(),
      status: 'active'
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  async getUsers(): Promise<User[]> {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users.map((user: any) => ({
      ...user,
      connectionTime: new Date(user.connectionTime),
      disconnectionTime: user.disconnectionTime ? new Date(user.disconnectionTime) : undefined
    }));
  },

  async disconnectUser(userId: string): Promise<void> {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].status = 'disconnected';
      users[userIndex].disconnectionTime = new Date();
      users[userIndex].sessionDuration = Date.now() - new Date(users[userIndex].connectionTime).getTime();
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  // Admin user management
  async loginAdmin(username: string, password: string): Promise<AdminUser | null> {
    // Ensure admin users exist before attempting login
    ensureAdminUsers();
    
    const adminUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
    
    // For demo purposes, accept specific passwords for existing users
    const validCredentials = [
      { username: 'admin', password: 'admin' },
      { username: 'marcom', password: 'marcom' },
      { username: 'technician', password: 'technician' }
    ];
    
    const isValidCredential = validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );
    
    if (!isValidCredential) {
      return null;
    }
    
    const admin = adminUsers.find((u: AdminUser) => u.username === username && u.isActive);
    
    if (admin) {
      admin.lastLogin = new Date();
      const updatedUsers = adminUsers.map((u: AdminUser) => u.id === admin.id ? admin : u);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(updatedUsers));
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
      return admin;
    }
    return null;
  },

  async getCurrentAdmin(): Promise<AdminUser | null> {
    const currentAdmin = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
    if (currentAdmin) {
      const admin = JSON.parse(currentAdmin);
      return {
        ...admin,
        createdAt: new Date(admin.createdAt),
        lastLogin: admin.lastLogin ? new Date(admin.lastLogin) : undefined
      };
    }
    return null;
  },

  async logoutAdmin(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
  },

  async getAdminUsers(): Promise<AdminUser[]> {
    const adminUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
    return adminUsers.map((admin: any) => ({
      ...admin,
      createdAt: new Date(admin.createdAt),
      lastLogin: admin.lastLogin ? new Date(admin.lastLogin) : undefined
    }));
  },

  async createAdminUser(userData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> {
    const adminUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
    const newAdmin: AdminUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    adminUsers.push(newAdmin);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsers));
    return newAdmin;
  },

  async updateAdminUser(id: string, userData: Partial<AdminUser>): Promise<AdminUser | null> {
    const adminUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
    const userIndex = adminUsers.findIndex((u: AdminUser) => u.id === id);
    if (userIndex !== -1) {
      adminUsers[userIndex] = { ...adminUsers[userIndex], ...userData };
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsers));
      return adminUsers[userIndex];
    }
    return null;
  },

  async deleteAdminUser(id: string): Promise<void> {
    const adminUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
    const filteredUsers = adminUsers.filter((u: AdminUser) => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(filteredUsers));
  },

  // Portal design management
  async getPortalDesign(): Promise<PortalDesign> {
    const design = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTAL_DESIGN) || '{}');
    return {
      ...design,
      updatedAt: new Date(design.updatedAt)
    };
  },

  async updatePortalDesign(designData: Partial<PortalDesign>): Promise<PortalDesign> {
    const currentDesign = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTAL_DESIGN) || '{}');
    const updatedDesign = {
      ...currentDesign,
      ...designData,
      updatedAt: new Date()
    };
    localStorage.setItem(STORAGE_KEYS.PORTAL_DESIGN, JSON.stringify(updatedDesign));
    return updatedDesign;
  },

  // Device management
  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Try to get real data from MikroTik if connected
      const mikrotikStatus = mikrotikAPI.getConnectionStatus();
      if (mikrotikStatus.isConnected) {
        const systemResources = await mikrotikAPI.getSystemResources();
        return {
          id: '1',
          name: mikrotikStatus.systemInfo?.identity || 'MikroTik Router',
          model: systemResources.boardName || 'Unknown',
          routerOSVersion: systemResources.version || 'Unknown',
          uptime: systemResources.uptime ? this.parseUptimeToSeconds(systemResources.uptime) : 0,
          cpuUsage: systemResources.cpuLoad || 0,
          memoryUsage: systemResources.totalMemory ? 
            Math.round(((systemResources.totalMemory - systemResources.freeMemory) / systemResources.totalMemory) * 100) : 0,
          lastUpdated: new Date(),
          status: 'online' as const
        };
      }
    } catch (error) {
      console.warn('Failed to get MikroTik data, using mock data:', error);
    }
    
    // Fallback to mock data
    const device = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVICE_INFO) || '{}');
    return {
      ...device,
      lastUpdated: new Date(device.lastUpdated)
    };
  },

  parseUptimeToSeconds(uptime: string): number {
    // Convert uptime string like "10d 5h 30m" to seconds
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
  },

  async getNetworkInterfaces(): Promise<NetworkInterface[]> {
    try {
      // Try to get real data from MikroTik if connected
      const mikrotikStatus = mikrotikAPI.getConnectionStatus();
      if (mikrotikStatus.isConnected) {
        const interfaces = await mikrotikAPI.getInterfaces();
        return interfaces.map((iface: any, index: number) => ({
          id: (index + 1).toString(),
          name: iface.name,
          type: iface.type === 'ether' ? 'ethernet' : 
                iface.type === 'wlan' ? 'wireless' : 'bridge',
          status: iface.running && !iface.disabled ? 'up' : 'down',
          rxBytes: iface.rxByte || 0,
          txBytes: iface.txByte || 0,
          rxPackets: iface.rxPacket || 0,
          txPackets: iface.txPacket || 0,
          speed: iface.type === 'ether' ? '1Gbps' : 
                 iface.type === 'wlan' ? '300Mbps' : '1Gbps',
          lastUpdated: new Date()
        }));
      }
    } catch (error) {
      console.warn('Failed to get MikroTik interfaces, using mock data:', error);
    }
    
    // Fallback to mock data
    const interfaces = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERFACES) || '[]');
    return interfaces.map((iface: any) => ({
      ...iface,
      lastUpdated: new Date(iface.lastUpdated)
    }));
  },

  async getTrafficLogs(interfaceId?: string, hours: number = 24): Promise<TrafficLog[]> {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAFFIC_LOGS) || '[]');
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return logs
      .filter((log: any) => {
        const logTime = new Date(log.timestamp);
        return logTime >= cutoffTime && (!interfaceId || log.interfaceId === interfaceId);
      })
      .map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
  },

  async getAlerts(): Promise<Alert[]> {
    const alerts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
    return alerts.map((alert: any) => ({
      ...alert,
      timestamp: new Date(alert.timestamp),
      resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined
    }));
  },

  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const alerts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALERTS) || '[]');
    const alertIndex = alerts.findIndex((a: Alert) => a.id === alertId);
    if (alertIndex !== -1) {
      alerts[alertIndex].resolved = true;
      alerts[alertIndex].resolvedBy = resolvedBy;
      alerts[alertIndex].resolvedAt = new Date();
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    }
  }
};

// Mock Mikrotik API integration
export const mikrotikApi = {
  async authenticate(ip: string, username: string, password: string): Promise<boolean> {
    // Mock authentication - in real implementation, this would connect to Mikrotik API
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  },

  async getSystemInfo(): Promise<DeviceInfo> {
    // Mock system info - in real implementation, this would fetch from Mikrotik API
    return api.getDeviceInfo();
  },

  async getInterfaces(): Promise<NetworkInterface[]> {
    // Mock interfaces - in real implementation, this would fetch from Mikrotik API
    return api.getNetworkInterfaces();
  },

  async authorizeUser(username: string, password: string): Promise<boolean> {
    // Mock user authorization for hotspot - in real implementation, this would use RADIUS
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  },

  async disconnectUser(username: string): Promise<void> {
    // Mock user disconnection - in real implementation, this would disconnect via Mikrotik API
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }
};

// Utility functions
export const utils = {
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },

  exportToCSV(data: any[], filename: string): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value instanceof Date) {
          return value.toISOString();
        }
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
};