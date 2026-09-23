import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-stats.dto';
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    tenantId: string;
  }
}

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard overview data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully', type: DashboardResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboard(@Req() req: Request): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboardData(req.tenantId!);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Req() req: Request) {
    return this.dashboardService.getStats(req.tenantId!);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecentActivity(@Req() req: Request) {
    return this.dashboardService.getRecentActivity(req.tenantId!);
  }

  @Get('charts')
  @ApiOperation({ summary: 'Get chart data' })
  @ApiResponse({ status: 200, description: 'Chart data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCharts(@Req() req: Request) {
    return this.dashboardService.getCharts(req.tenantId!);
  }
}
