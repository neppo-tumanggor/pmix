import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserPreferencesService } from '../services/user-preferences.service';
import { UserMetadataService } from '../services/user-metadata.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../auth/guards/tenant.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { TenantId, UserId } from '../../auth/decorators/tenant-id.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly preferencesService: UserPreferencesService,
    private readonly metadataService: UserMetadataService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMe(@UserId() userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateMe(@UserId() userId: string, @Body() updateData: any) {
    return this.usersService.updateProfile(userId, updateData);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({ status: 200, description: 'Returns user preferences' })
  async getPreferences(@UserId() userId: string, @TenantId() tenantId: string) {
    return this.preferencesService.getPreferences(userId);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updatePreferences(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Body() updateData: any,
  ) {
    return this.preferencesService.updatePreferences(userId, tenantId, updateData);
  }

  @Get('me/metadata')
  @ApiOperation({ summary: 'Get all user metadata' })
  @ApiResponse({ status: 200, description: 'Returns user metadata' })
  async getMetadata(@UserId() userId: string) {
    return this.metadataService.getAllMetadata(userId);
  }

  @Post('me/metadata')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Set user metadata' })
  @ApiResponse({ status: 201, description: 'Metadata created/updated' })
  async setMetadata(
    @UserId() userId: string,
    @TenantId() tenantId: string,
    @Body('key') key: string,
    @Body('value') value: any,
  ) {
    return this.metadataService.setMetadata(userId, tenantId, key, value);
  }

  @Delete('me/metadata/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user metadata' })
  @ApiResponse({ status: 204, description: 'Metadata deleted' })
  async deleteMetadata(@UserId() userId: string, @Param('key') key: string) {
    await this.metadataService.deleteMetadata(userId, key);
  }
}
