import apiClient from './auth';
import { DashboardData } from '@/lib/types/dashboard';

export const dashboardApi = {
  /**
   * Get complete dashboard data
   */
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  /**
   * Get dashboard statistics only
   */
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async () => {
    const response = await apiClient.get('/dashboard/recent-activity');
    return response.data;
  },

  /**
   * Get chart data
   */
  getCharts: async () => {
    const response = await apiClient.get('/dashboard/charts');
    return response.data;
  },
};
