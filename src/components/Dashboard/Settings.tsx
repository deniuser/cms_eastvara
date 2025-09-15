import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Wifi, 
  Shield, 
  Bell, 
  Database, 
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { mikrotikManager } from '../../utils/mikrotik-api';

const Settings: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [mikrotikTesting, setMikrotikTesting] = useState(false);
  const [mikrotikStatus, setMikrotikStatus] = useState<{
    connected: boolean;
    method?: string;
    error?: string;
    systemInfo?: any;
  } | null>(null);
  
  const [settings, setSettings] = useState({
    // Network Settings
    networkName: 'Mall-WiFi',
    networkPassword: 'admin123',
    dhcpPool: '192.168.1.100-192.168.1.200',
    dnsServer: '8.8.8.8',
    
    // Security Settings
    sessionTimeout: 240, // minutes
    maxConnections: 500,
    bandwidthLimit: 10, // Mbps
    
    // Notification Settings
    emailNotifications: true,
    alertThreshold: 80, // percentage
    dailyReport: true,
    
    // System Settings
    backupInterval: 24, // hours
    logRetention: 30, // days
    autoUpdate: false,
    
    // MikroTik Settings
    mikrotikHost: '',
    mikrotikUsername: '',
    mikrotikPassword: '',
    mikrotikPort: 8728
  });

  // Load MikroTik config on component mount
  React.useEffect(() => {
    const hasConfig = mikrotikManager.loadConfig();
    if (hasConfig) {
      // Config loaded, check if still connected
      setMikrotikStatus({
        connected: mikrotikManager.isConnected(),
        method: mikrotikManager.getCurrentMethod() || undefined
      });
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTestMikroTikConnection = async () => {
    setMikrotikTesting(true);
    setMikrotikStatus(null);
    
    try {
      const result = await mikrotikManager.connect(
        settings.mikrotikHost,
        settings.mikrotikUsername,
        settings.mikrotikPassword,
        settings.mikrotikPort,
        false // useHttps - can be made configurable
      );
      
      if (result.success) {
        mikrotikManager.saveConfig();
      setSettings(prev => ({
        ...prev,
          mikrotikHost: settings.mikrotikHost,
          mikrotikUsername: settings.mikrotikUsername,
          mikrotikPassword: settings.mikrotikPassword,
          mikrotikPort: settings.mikrotikPort
      }));
      setMikrotikStatus({
          connected: true,
          method: result.method,
          systemInfo: result.systemInfo
      });
      } else {
        setMikrotikStatus({
          connected: false,
          error: result.error || 'Connection failed'
        });
      }
    } catch (error) {
      setMikrotikStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Unexpected connection error'
      });
    } finally {
      setMikrotikTesting(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, this would save to backend
      console.log('Settings saved:', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Wifi className="w-5 h-5 mr-2" />
            Network Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={settings.networkName}
                onChange={(e) => handleChange('networkName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network Password
              </label>
              <input
                type="password"
                value={settings.networkPassword}
                onChange={(e) => handleChange('networkPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DHCP Pool
              </label>
              <input
                type="text"
                value={settings.dhcpPool}
                onChange={(e) => handleChange('dhcpPool', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DNS Server
              </label>
              <input
                type="text"
                value={settings.dnsServer}
                onChange={(e) => handleChange('dnsServer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Connections
              </label>
              <input
                type="number"
                value={settings.maxConnections}
                onChange={(e) => handleChange('maxConnections', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bandwidth Limit (Mbps)
              </label>
              <input
                type="number"
                value={settings.bandwidthLimit}
                onChange={(e) => handleChange('bandwidthLimit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Email Notifications
              </label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Threshold (%)
              </label>
              <input
                type="number"
                value={settings.alertThreshold}
                onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Daily Report
              </label>
              <input
                type="checkbox"
                checked={settings.dailyReport}
                onChange={(e) => handleChange('dailyReport', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            System Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Interval (hours)
              </label>
              <input
                type="number"
                value={settings.backupInterval}
                onChange={(e) => handleChange('backupInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Retention (days)
              </label>
              <input
                type="number"
                value={settings.logRetention}
                onChange={(e) => handleChange('logRetention', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auto Update
              </label>
              <input
                type="checkbox"
                checked={settings.autoUpdate}
                onChange={(e) => handleChange('autoUpdate', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mikrotik Integration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Mikrotik Router Integration
        </h3>
        
        {/* Connection Status */}
        {mikrotikStatus && (
          <div className={`mb-4 p-3 rounded-lg flex items-center ${
            mikrotikStatus.connected 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {mikrotikStatus.connected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">
                    Connected Successfully {mikrotikStatus.method && `(${mikrotikStatus.method})`}
                  </p>
                  {mikrotikStatus.systemInfo && (
                    <p className="text-green-600 text-sm">
                      {mikrotikStatus.systemInfo.identity || mikrotikStatus.systemInfo['board-name']} - RouterOS {mikrotikStatus.systemInfo.version}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">Connection Failed</p>
                  <p className="text-red-600 text-sm">{mikrotikStatus.error}</p>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Router IP Address
            </label>
            <input
              type="text"
              value={settings.mikrotikHost}
              onChange={(e) => handleChange('mikrotikHost', e.target.value)}
              placeholder="192.168.1.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Username
            </label>
            <input
              type="text"
              value={settings.mikrotikUsername}
              onChange={(e) => handleChange('mikrotikUsername', e.target.value)}
              placeholder="admin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Password
            </label>
            <input
              type="password"
              value={settings.mikrotikPassword}
              onChange={(e) => handleChange('mikrotikPassword', e.target.value)}
              placeholder="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Port
            </label>
            <input
              type="number"
              value={settings.mikrotikPort}
              onChange={(e) => handleChange('mikrotikPort', parseInt(e.target.value) || 8728)}
              placeholder="8728"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 8728 (API), 80 (HTTP), 443 (HTTPS)</p>
          </div>
        </div>
        
        <div className="mt-4">
          <button 
            onClick={handleTestMikroTikConnection}
            disabled={mikrotikTesting || !settings.mikrotikHost || !settings.mikrotikUsername}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {mikrotikTesting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </button>
        </div>
        
        {/* System Information */}
        {mikrotikStatus?.connected && mikrotikStatus.systemInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Router Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Identity:</span>
                <span className="ml-2 font-medium">{mikrotikStatus.systemInfo.identity || mikrotikStatus.systemInfo['board-name']}</span>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-medium">{mikrotikStatus.systemInfo.version}</span>
              </div>
              <div>
                <span className="text-gray-600">Uptime:</span>
                <span className="ml-2 font-medium">{mikrotikStatus.systemInfo.uptime}</span>
              </div>
              <div>
                <span className="text-gray-600">CPU Load:</span>
                <span className="ml-2 font-medium">{mikrotikStatus.systemInfo['cpu-load'] || 0}%</span>
              </div>
              <div>
                <span className="text-gray-600">Free Memory:</span>
                <span className="ml-2 font-medium">{Math.round((mikrotikStatus.systemInfo['free-memory'] || 0) / 1024 / 1024)} MB</span>
              </div>
              <div>
                <span className="text-gray-600">Total Memory:</span>
                <span className="ml-2 font-medium">{Math.round((mikrotikStatus.systemInfo['total-memory'] || 0) / 1024 / 1024)} MB</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Setup Instructions */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Setup Instructions</h4>
              <div className="text-blue-700 text-sm space-y-1">
                <p><strong>Option 1: WebSocket API (Recommended)</strong></p>
                <p>1. Enable WebSocket service: <code className="bg-blue-100 px-1 rounded">/ip service enable www</code></p>
                <p>2. Enable API: <code className="bg-blue-100 px-1 rounded">/ip service enable api</code></p>
                <p><strong>Option 2: HTTP REST API</strong></p>
                <p>1. Enable REST API: <code className="bg-blue-100 px-1 rounded">/ip service enable www</code></p>
                <p>2. Create API user with full permissions</p>
                <p>3. Ensure router is accessible from this network</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;