import { ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/entities/role.enum';
import { UserDto } from 'src/user/dto/user.dto';

export const validateTenantAccess = (requester: UserDto, tenantId: string) => {
  if (requester.role === UserRole.admin && requester.tenantId !== tenantId) {
    throw new ForbiddenException(
      'You can access users only within your own tenant.',
    );
  }
};
