import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class SubmissionSortQueryDto {
  /**
   * One of createdAt, expectedSalary, recruiterRating, matchScore.
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

export class SubmissionTenantSortQueryDto extends SubmissionSortQueryDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
