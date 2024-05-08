import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // No roles specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles || user.roles.length === 0) {
      return false; // No user, deny access
    }

    //if user email is not verified
    if (!user.isEmailVerified)
      throw new BadRequestException('Email is not verified.');

    // if merchant is not verified.
    if (user.roles.includes(Role.SELLER) && !user.merchant.isVerified) {
      throw new ForbiddenException('You are not verified as a seller.');
    }
    const isAuthorized = requiredRoles.every((role) =>
      user.roles.includes(role),
    );
    if (!isAuthorized) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
