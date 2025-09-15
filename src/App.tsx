import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AdminLogin from './components/AdminLogin';
import CaptivePortal from './components/CaptivePortal';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Overview from './components/Dashboard/Overview';
import UserSessions from './components/Dashboard/UserSessions';
import PortalDesigner from './components/Dashboard/PortalDesigner';
import DeviceMonitor from './components/Dashboard/DeviceMonitor';
import UserManagement from './components/Dashboard/UserManagement';
import Settings from './components/Dashboard/Settings';

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public captive portal route */}
        <Route path="/portal" element={<CaptivePortal />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={
          isAuthenticated ? (
            <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
              {currentPage === 'overview' && <Overview />}
              {currentPage === 'users' && <UserSessions />}
              {currentPage === 'portal-design' && <PortalDesigner />}
              {currentPage === 'device-monitor' && <DeviceMonitor />}
              {currentPage === 'user-management' && <UserManagement />}
              {currentPage === 'settings' && <Settings />}
            </DashboardLayout>
          ) : (
            <AdminLogin />
          )
        } />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/portal" replace />} />
      </Routes>
    </Router>
  );
};

export default App;