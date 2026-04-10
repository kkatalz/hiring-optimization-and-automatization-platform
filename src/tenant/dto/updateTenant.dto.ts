import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto {
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly slug?: string;
}
