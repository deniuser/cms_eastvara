import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Router,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api, utils } from '../../utils/api';
import { DeviceInfo, NetworkInterface, Alert } from '../../types';

const DeviceMonitor: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterface, setSelectedInterface] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        let deviceData, interfacesData;
        
        try {
          // Try to get real data from MikroTik
          [deviceData, interfacesData] = await Promise.all([
            api.getDeviceInfo(),
            api.getNetworkInterfaces()
          ]);
        } catch (mikrotikError) {
          // Show error message if MikroTik is not connected
          console.error('MikroTik connection error:', mikrotikError);
          setLoading(false);
          return;
        }
        
        const alertsData = await api.getAlerts();
        
        setDeviceInfo(deviceData);
        setInterfaces(interfacesData);
        setAlerts(alertsData);
        
        if (interfacesData.length > 0 && !selectedInterface) {
          setSelectedInterface(interfacesData[0].id);
        }
      } catch (error) {
        console.error('Error loading device data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, [selectedInterface]);

  const generateTrafficData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rx: Math.floor(Math.random() * 100) + 50,
        tx: Math.floor(Math.random() * 80) + 30
      });
    }
    
    return data;
  };

  const generateCpuMemoryData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 20) + 40
      });
    }
    
    return data;
  };

  const trafficData = generateTrafficData();
  const systemData = generateCpuMemoryData();

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId, 'admin');
      const updatedAlerts = await api.getAlerts();
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!deviceInfo) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">MikroTik Router Not Connected</h2>
          <p className="text-yellow-700 mb-4">
            Please configure your MikroTik router connection in Settings to view device monitoring data.
          </p>
          <button
            onClick={() => window.location.href = '/admin#settings'}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Device Monitor</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${deviceInfo?.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {deviceInfo?.status === 'online' ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-blue-600">{deviceInfo?.cpuUsage || 0}%</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-green-600">{deviceInfo?.memoryUsage || 0}%</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <MemoryStick className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-purple-600">
                {deviceInfo ? utils.formatDuration(deviceInfo.uptime * 1000) : '0'}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{unresolvedAlerts.length}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={systemData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="CPU (%)"
                />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stackId="2" 
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Memory (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Interface Traffic</h3>
          <div className="mb-4">
            <select
              value={selectedInterface}
              onChange={(e) => setSelectedInterface(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {interfaces.map(iface => (
                <option key={iface.id} value={iface.id}>{iface.name}</option>
              ))}
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rx" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Download (Mbps)"
                />
                <Line 
                  type="monotone" 
                  dataKey="tx" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Upload (Mbps)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Network Interfaces */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Network Interfaces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interfaces.map((iface) => (
            <div key={iface.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Wifi className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{iface.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{iface.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  iface.status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {iface.status}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Speed</span>
                  <span className="text-sm font-medium">{iface.speed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">RX</span>
                  <span className="text-sm font-medium flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1 text-blue-600" />
                    {utils.formatBytes(iface.rxBytes)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">TX</span>
                  <span className="text-sm font-medium flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                    {utils.formatBytes(iface.txBytes)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Router className="w-5 h-5 mr-2" />
            System Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Device Name</span>
              <span className="font-medium">{deviceInfo?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model</span>
              <span className="font-medium">{deviceInfo?.model || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">RouterOS Version</span>
              <span className="font-medium">{deviceInfo?.routerOSVersion || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">
                {deviceInfo?.lastUpdated ? deviceInfo.lastUpdated.toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {unresolvedAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            ) : (
              unresolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceMonitor;