import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';

export function extractUserTenantId(
  user: UserDto,
  tenantId: string | undefined,
): string {
  if (user.role === UserRole.superAdmin && !tenantId) {
    throw new HttpException(
      'Super admin must provide tenantId query parameter.',
      HttpStatus.BAD_REQUEST,
    );
  }

  tenantId = tenantId ?? user.tenantId;

  if (!tenantId) {
    throw new HttpException(
      'Tenant ID is required for this operation.',
      HttpStatus.BAD_REQUEST,
    );
  }

  return tenantId;
}
