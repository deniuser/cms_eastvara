import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wifi, 
  Activity, 
  HardDrive, 
  TrendingUp, 
  Clock,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api, utils } from '../../utils/api';
import { User, DeviceInfo, Alert } from '../../types';

const Overview: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        let usersData, deviceData;
        
        try {
          // Try to get real data from MikroTik
          [usersData, deviceData] = await Promise.all([
            api.getActiveHotspotUsers(),
            api.getDeviceInfo()
          ]);
        } catch (mikrotikError) {
          // Fallback to stored data if MikroTik is not connected
          console.warn('MikroTik not connected, using stored data:', mikrotikError);
          usersData = await api.getUsers();
          deviceData = null;
        }
        
        const alertsData = await api.getAlerts();
        
        setUsers(usersData);
        setDeviceInfo(deviceData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error loading overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const activeUsers = users.filter(user => user.status === 'active').length;
  const totalUsers = users.length;
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved).length;

  // Generate mock traffic data for the last 24 hours
  const generateTrafficData = () => {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      data.push({
        time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        download: Math.floor(Math.random() * 100) + 50,
        upload: Math.floor(Math.random() * 50) + 20
      });
    }
    return data;
  };

  // Generate user activity data
  const generateUserActivityData = () => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString([], { weekday: 'short' }),
        users: Math.floor(Math.random() * 200) + 100
      });
    }
    return data;
  };

  const trafficData = generateTrafficData();
  const userActivityData = generateUserActivityData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalUsers} total sessions today
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Status</p>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {deviceInfo ? utils.formatDuration(deviceInfo.uptime * 1000) : 'N/A'} uptime
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-orange-600">
                {deviceInfo?.cpuUsage || 0}%
              </p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {deviceInfo?.memoryUsage || 0}% memory usage
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alerts</p>
              <p className="text-2xl font-bold text-red-600">{unresolvedAlerts}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {alerts.length} total alerts
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Network Traffic (24h)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="download" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Download (Mbps)"
                />
                <Line 
                  type="monotone" 
                  dataKey="upload" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Upload (Mbps)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            User Activity (7 days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{user.fullName}</p>
                  <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    user.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Disconnected'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.connectionTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Router Model</span>
              <span className="font-medium">{deviceInfo?.model || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">RouterOS Version</span>
              <span className="font-medium">{deviceInfo?.routerOSVersion || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium">
                {deviceInfo ? utils.formatDuration(deviceInfo.uptime * 1000) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">CPU Usage</span>
              <span className="font-medium">{deviceInfo?.cpuUsage || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Memory Usage</span>
              <span className="font-medium">{deviceInfo?.memoryUsage || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`font-medium ${
                deviceInfo?.status === 'online' ? 'text-green-600' : 'text-red-600'
              }`}>
                {deviceInfo?.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;