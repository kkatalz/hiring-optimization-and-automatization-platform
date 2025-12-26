import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class TenantDto {
  id: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  slug: string;
}
