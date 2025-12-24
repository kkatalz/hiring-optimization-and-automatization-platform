import { ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/entities/role.enum';
import { UserResponseDto } from 'src/user/dto/userResponse.dto';

export const validateTenantAccess = (
  requester: UserResponseDto,
  tenantId: string,
) => {
  if (requester.role === UserRole.admin && requester.tenantId !== tenantId) {
    throw new ForbiddenException(
      'You can access users only within your own tenant.',
    );
  }
};
