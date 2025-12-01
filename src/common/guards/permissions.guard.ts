import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Request } from 'express';
import { Role } from 'src/roles/entities/role.entity';

interface RequestUser {
  userId: number;
  email: string;
  roles: Role[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: RequestUser }>();
    const user = request.user;
    if (!user || !user.roles || user.roles.length === 0) return false;

    const userPermissions = user.roles.flatMap(
      (role) => role.permissions?.map((p) => p.name) || [],
    );
    return requiredPermissions.every((p) => userPermissions.includes(p));
  }
}
