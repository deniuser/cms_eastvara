import { useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { api } from '../utils/api';

export const useAuth = () => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentAdmin = async () => {
      try {
        const admin = await api.getCurrentAdmin();
        setCurrentAdmin(admin);
      } catch (error) {
        console.error('Error loading current admin:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentAdmin();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', username);
      const admin = await api.loginAdmin(username, password);
      console.log('Login result:', admin);
      if (admin) {
        setCurrentAdmin(admin);
        console.log('Current admin set:', admin);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logoutAdmin();
      setCurrentAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (requiredRole: AdminUser['role'] | AdminUser['role'][]): boolean => {
    if (!currentAdmin) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(currentAdmin.role);
  };

  return {
    currentAdmin,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!currentAdmin
  };
};