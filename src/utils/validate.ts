import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';

export const validateTenantAccess = (requester: UserDto, tenantId: string) => {
  if (
    (requester.role === UserRole.admin ||
      requester.role === UserRole.recruiter) &&
    requester.tenantId !== tenantId
  ) {
    throw new ForbiddenException(
      'You can access users/vacancies/vacancy submissions only within your own tenant.',
    );
  }
};
