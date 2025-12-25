import { UserRole } from 'src/entities/role.enum';

export class UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  token?: string;
}
