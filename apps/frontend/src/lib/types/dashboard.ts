export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalCampaigns: number;
  totalRevenue: number;
  customerGrowth: number;
  productGrowth: number;
  campaignGrowth: number;
  revenueGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'customer' | 'product' | 'campaign' | 'order';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

export interface ChartData {
  date: string;
  value: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  charts: {
    revenue: ChartData[];
    customers: ChartData[];
  };
}
