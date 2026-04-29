import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '../entities/role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Authentication required.' }),
    ApiForbiddenResponse({
      description: `Access denied. Required role(s): ${roles.join(', ')}.`,
    }),
  );
