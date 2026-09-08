import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantId } from '../decorators/tenant-id.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const tenantId = this.reflector.getAllAndOverride<string>('tenantId', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!tenantId) {
      // Try to get tenantId from request (e.g., from JWT token or subdomain)
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      if (user && user.tenantId) {
        // Attach tenantId to request
        request.tenantId = user.tenantId;
        return true;
      }
      
      // For development/testing, use a default tenant
      request.tenantId = 'default-tenant';
      return true;
    }

    const request = context.switchToHttp().getRequest();
    request.tenantId = tenantId;
    return true;
  }
}
