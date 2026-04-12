import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // viene del JwtStrategy

    if (!user?.sub) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const roles = await this.prisma.user_roles.findMany({
      where: { user_id: user.sub },
      include: { roles: true },
    });

    const userRoles = roles.map(r => r.roles.name);

    const hasRole = requiredRoles.some(role =>
      userRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('No tienes permisos');
    }

    return true;
  }
}