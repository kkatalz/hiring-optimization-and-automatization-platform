import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ChangeCredentialsDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;
}
