import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../types/pagination';

export class VacancySortPaginationQueryDto extends PaginationQueryDto {
  /**
   * One of createdAt, requiredYearsOfExperience, minSalary, maxSalary.
   * @example "createdAt"
   */
  @IsOptional()
  @IsString()
  sortBy?: string;

  /**
   * One of ASC, DESC.
   * @example "DESC"
   */
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}

export class VacancyWithQuestionsPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
