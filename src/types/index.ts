export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  gender: 'male' | 'female' | 'other';
  macAddress: string;
  deviceType: string;
  connectionTime: Date;
  disconnectionTime?: Date;
  sessionDuration?: number;
  dataUsage: number;
  ipAddress: string;
  status: 'active' | 'disconnected';
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'marcom' | 'technician';
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface PortalDesign {
  id: string;
  backgroundImage: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeText: string;
  footerText: string;
  buttonText: string;
  redirectUrl?: string;
  redirectDelay: number; // seconds
  showCampaign: boolean;
  campaignTitle?: string;
  campaignDescription?: string;
  campaignImage?: string;
  campaignButtonText?: string;
  campaignButtonUrl?: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  model: string;
  routerOSVersion: string;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  lastUpdated: Date;
  status: 'online' | 'offline';
}

export interface NetworkInterface {
  id: string;
  name: string;
  type: 'ethernet' | 'wireless' | 'bridge';
  status: 'up' | 'down';
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  speed: string;
  lastUpdated: Date;
}

export interface TrafficLog {
  id: string;
  interfaceId: string;
  timestamp: Date;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
}

export interface Alert {
  id: string;
  type: 'bandwidth' | 'system' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface SessionFilter {
  startDate?: Date;
  endDate?: Date;
  status?: 'active' | 'disconnected' | 'all';
  searchQuery?: string;
}

export interface TrafficThreshold {
  interfaceId: string;
  rxThreshold: number;
  txThreshold: number;
  enabled: boolean;
}