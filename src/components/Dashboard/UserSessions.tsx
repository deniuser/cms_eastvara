import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Users, 
  Clock, 
  Wifi, 
  WifiOff,
  Calendar,
  Phone,
  User as UserIcon
} from 'lucide-react';
import { api, utils } from '../../utils/api';
import { User, SessionFilter } from '../../types';

const UserSessions: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SessionFilter>({
    status: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await api.getUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    const interval = setInterval(loadUsers, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by status
    if (filter.status !== 'all') {
      filtered = filtered.filter(user => user.status === filter.status);
    }

    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(query) ||
        user.phoneNumber.includes(query) ||
        user.macAddress.toLowerCase().includes(query) ||
        user.ipAddress.includes(query)
      );
    }

    // Filter by date range
    if (filter.startDate && filter.endDate) {
      filtered = filtered.filter(user =>
        user.connectionTime >= filter.startDate! &&
        user.connectionTime <= filter.endDate!
      );
    }

    setFilteredUsers(filtered);
  }, [users, filter]);

  const handleFilterChange = (key: keyof SessionFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleDisconnectUser = async (userId: string) => {
    try {
      await api.disconnectUser(userId);
      const updatedUsers = await api.getUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error disconnecting user:', error);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredUsers.map(user => ({
      'Full Name': user.fullName,
      'Phone Number': user.phoneNumber,
      'Gender': user.gender,
      'MAC Address': user.macAddress,
      'IP Address': user.ipAddress,
      'Device Type': user.deviceType,
      'Connection Time': user.connectionTime.toISOString(),
      'Disconnection Time': user.disconnectionTime?.toISOString() || '',
      'Session Duration': user.sessionDuration ? utils.formatDuration(user.sessionDuration) : '',
      'Data Usage': utils.formatBytes(user.dataUsage),
      'Status': user.status
    }));

    utils.exportToCSV(exportData, `user-sessions-${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">User Sessions</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Name, phone, MAC, IP..."
                value={filter.searchQuery || ''}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filter.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="disconnected">Disconnected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filter.startDate ? filter.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filter.endDate ? filter.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Data</p>
              <p className="text-2xl font-bold text-purple-600">
                {utils.formatBytes(filteredUsers.reduce((sum, user) => sum + user.dataUsage, 0))}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500 capitalize">{user.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-4 h-4 mr-1" />
                      {user.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.deviceType}</div>
                    <div className="text-sm text-gray-500">{user.macAddress}</div>
                    <div className="text-sm text-gray-500">{user.ipAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1" />
                      {user.connectionTime.toLocaleString()}
                    </div>
                    {user.disconnectionTime && (
                      <div className="text-sm text-gray-500">
                        Disconnected: {user.disconnectionTime.toLocaleString()}
                      </div>
                    )}
                    {user.sessionDuration && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {utils.formatDuration(user.sessionDuration)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{utils.formatBytes(user.dataUsage)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'active' ? (
                        <Wifi className="w-3 h-3 mr-1" />
                      ) : (
                        <WifiOff className="w-3 h-3 mr-1" />
                      )}
                      {user.status === 'active' ? 'Active' : 'Disconnected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.status === 'active' && (
                      <button
                        onClick={() => handleDisconnectUser(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Disconnect
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No user sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSessions;