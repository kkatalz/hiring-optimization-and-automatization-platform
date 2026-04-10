import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto {
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly slug?: string;
}
