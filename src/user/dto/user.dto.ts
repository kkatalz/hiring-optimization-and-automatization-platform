import { UserRole } from 'src/entities/enums';

export class UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  role: UserRole;
}
