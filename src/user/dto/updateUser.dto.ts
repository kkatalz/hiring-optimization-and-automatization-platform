import { IsEmail, IsOptional } from 'class-validator';
import { UserRole } from 'src/entities/role.enum';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  password: string;

  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  role: UserRole;
}
