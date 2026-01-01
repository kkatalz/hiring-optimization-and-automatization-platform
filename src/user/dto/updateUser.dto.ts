import { IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../entities/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  role?: UserRole;
}
