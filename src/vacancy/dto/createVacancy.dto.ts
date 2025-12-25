import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVacancyDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  tags: string[];

  @IsOptional()
  @IsString()
  salary?: string;
}
