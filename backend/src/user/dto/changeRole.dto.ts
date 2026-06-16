import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../entities/role.enum';

export class ChangeRoleDto {
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
