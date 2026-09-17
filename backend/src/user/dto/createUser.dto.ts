import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsValidPassword } from '../../decorators/isValidPassword.decorator';
import {
  FIRST_NAME_MAX_LENGTH,
  IsValidName,
  LAST_NAME_MAX_LENGTH,
} from '../../decorators/isValidName.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsValidPassword()
  password: string;

  @IsValidName(FIRST_NAME_MAX_LENGTH)
  firstName: string;

  @IsValidName(LAST_NAME_MAX_LENGTH)
  lastName: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
