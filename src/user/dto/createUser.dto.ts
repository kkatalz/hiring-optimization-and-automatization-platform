import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from 'src/entities/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  role: UserRole;

  @IsOptional()
  tenantId: string;
}
