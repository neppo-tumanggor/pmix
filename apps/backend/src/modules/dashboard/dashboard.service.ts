import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { DashboardStatsResponseDto, RecentActivityDto, DashboardResponseDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getStats(tenantId: string): Promise<DashboardStatsResponseDto> {
    const [
      totalCustomers,
      totalProducts,
      totalCampaigns,
      totalRevenue,
    ] = await Promise.all([
      this.usersRepository.count({
        where: { tenantId, deletedAt: IsNull() },
      }),
      this.productsRepository.count({
        where: { tenantId, deletedAt: IsNull() },
      }),
      Promise.resolve(12), // TODO: Replace with actual campaign count when campaign module is ready
      Promise.resolve(45200000), // TODO: Replace with actual revenue calculation
    ]);

    // Calculate growth rates (mock data for now, replace with actual calculations)
    const customerGrowth = 12.5;
    const productGrowth = 8.3;
    const campaignGrowth = 15.2;
    const revenueGrowth = 23.4;

    return {
      totalCustomers,
      totalProducts,
      totalCampaigns,
      totalRevenue,
      customerGrowth,
      productGrowth,
      campaignGrowth,
      revenueGrowth,
    };
  }

  async getRecentActivity(tenantId: string): Promise<RecentActivityDto[]> {
    // TODO: Implement actual activity logging system
    // For now, return mock data based on recent users and products
    const recentUsers = await this.usersRepository.find({
      where: { tenantId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentProducts = await this.productsRepository.find({
      where: { tenantId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const activities: RecentActivityDto[] = [];

    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: 'customer',
        title: 'New customer registered',
        description: `${user.email} joined the platform`,
        timestamp: user.createdAt,
        icon: 'user',
      });
    });

    recentProducts.forEach((product) => {
      activities.push({
        id: `product-${product.id}`,
        type: 'product',
        title: 'Product created',
        description: `${product.name} was added to catalog`,
        timestamp: product.createdAt,
        icon: 'package',
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  async getCharts(tenantId: string): Promise<DashboardResponseDto['charts']> {
    // TODO: Implement actual chart data from database
    // For now, return mock data for the last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    const revenue = [];
    const customers = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = days[date.getDay()];
      
      // Mock data - replace with actual calculations
      revenue.push({
        date: dateStr,
        value: Math.floor(Math.random() * 10000000) + 5000000,
      });
      
      customers.push({
        date: dateStr,
        value: Math.floor(Math.random() * 50) + 20,
      });
    }

    return { revenue, customers };
  }

  async getDashboardData(tenantId: string): Promise<DashboardResponseDto> {
    const [stats, recentActivity, charts] = await Promise.all([
      this.getStats(tenantId),
      this.getRecentActivity(tenantId),
      this.getCharts(tenantId),
    ]);

    return {
      stats,
      recentActivity,
      charts,
    };
  }
}
