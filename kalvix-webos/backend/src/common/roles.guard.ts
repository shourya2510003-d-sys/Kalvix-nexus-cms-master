import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    if (!requiredRoles.length) {
      return true; // no roles required
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.roles) {
      return false;
    }
    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [user.roles];
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
