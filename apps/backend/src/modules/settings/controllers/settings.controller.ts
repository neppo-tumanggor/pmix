import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service';
import { SettingCategory } from '../entities/settings.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { SettingsResponseDto } from '../dto/settings-response.dto';
import { TenantId, UserId, IpAddress, UserAgent } from '../../auth/decorators/tenant-id.decorator';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all available setting categories' })
  @ApiResponse({ status: 200, description: 'Returns list of categories', type: [String] })
  async getCategories() {
    // Public endpoint - returns all available categories
    return Object.values(SettingCategory);
  }

  @Get(':category')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all settings for a category (Admin/Manager only)' })
  @ApiParam({ name: 'category', description: 'Settings category' })
  @ApiResponse({ status: 200, description: 'Returns settings for category', type: SettingsResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
  async getByCategory(
    @Param('category') category: SettingCategory,
    @TenantId() tenantId: string,
  ) {
    return this.settingsService.getByCategory(tenantId, category);
  }

  @Get(':category/:key')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a specific setting by key (Admin/Manager only)' })
  @ApiParam({ name: 'category', description: 'Settings category' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Returns setting value' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin/Manager only' })
  async getByKey(
    @Param('category') category: SettingCategory,
    @Param('key') key: string,
    @TenantId() tenantId: string,
  ) {
    return this.settingsService.getByKey(tenantId, category, key);
  }

  @Patch(':category')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update settings for a category (Admin only)' })
  @ApiParam({ name: 'category', description: 'Settings category' })
  @ApiResponse({ status: 204, description: 'Settings updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async updateCategory(
    @Param('category') category: SettingCategory,
    @Body() updateSettingsDto: UpdateSettingsDto,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
  ) {
    await this.settingsService.updateCategory(
      tenantId,
      category,
      updateSettingsDto.data,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Post(':category/initialize')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initialize default settings for a category (Admin only)' })
  @ApiParam({ name: 'category', description: 'Settings category' })
  @ApiResponse({ status: 201, description: 'Default settings created' })
  @ApiResponse({ status: 409, description: 'Settings already initialized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async initializeCategory(
    @Param('category') category: SettingCategory,
    @TenantId() tenantId: string,
  ) {
    const count = await this.settingsService.initializeDefaults(tenantId);
    return { message: `Initialized ${count} default settings`, count };
  }

  @Delete(':category/:key')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific setting (Admin only)' })
  @ApiParam({ name: 'category', description: 'Settings category' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 204, description: 'Setting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async deleteSetting(
    @Param('category') category: SettingCategory,
    @Param('key') key: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @IpAddress() ipAddress: string,
    @UserAgent() userAgent: string,
  ) {
    await this.settingsService.delete(tenantId, category, key, userId, ipAddress, userAgent);
  }
}
