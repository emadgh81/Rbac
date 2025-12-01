import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { Role } from 'src/roles/entities/role.entity';

interface RequestUser {
  userId: number;
  email: string;
  roles: Role[];
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user: RequestUser }>();
    if (!user || !user.roles) return false;

    const userRoles = user.roles.map((r) => r.name);
    return requiredRoles.some((r) => userRoles.includes(r));
  }
}
