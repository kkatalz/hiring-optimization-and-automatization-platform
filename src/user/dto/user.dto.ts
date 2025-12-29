import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../../entities/role.enum';

export class UserDto {
  id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  role: UserRole;

  @IsString()
  tenantId?: string;

  @IsString()
  token?: string;
}
