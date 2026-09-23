export class DashboardStatsResponseDto {
  totalCustomers: number;
  totalProducts: number;
  totalCampaigns: number;
  totalRevenue: number;
  customerGrowth: number;
  productGrowth: number;
  campaignGrowth: number;
  revenueGrowth: number;
}

export class RecentActivityDto {
  id: string;
  type: 'customer' | 'product' | 'campaign' | 'order';
  title: string;
  description: string;
  timestamp: Date;
  icon?: string;
}

export class DashboardResponseDto {
  stats: DashboardStatsResponseDto;
  recentActivity: RecentActivityDto[];
  charts: {
    revenue: { date: string; value: number }[];
    customers: { date: string; value: number }[];
  };
}
