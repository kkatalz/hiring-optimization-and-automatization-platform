import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsUUID } from 'class-validator';

export const SUBMISSION_SORT_FIELDS = [
  'createdAt',
  'expectedSalary',
  'recruiterRating',
  'matchScore',
  'commentAiScore',
  'resumeAiScore',
] as const;

export type SubmissionSortField = (typeof SUBMISSION_SORT_FIELDS)[number];

export class SubmissionSortQueryDto {
  /** @example "createdAt"*/
  @ApiProperty({
    enum: SUBMISSION_SORT_FIELDS,
    required: false,
  })
  @IsOptional()
  @IsIn(SUBMISSION_SORT_FIELDS)
  sortBy?: SubmissionSortField;

  /** @example "DESC"   */
  @ApiProperty({
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}

export class SubmissionTenantSortQueryDto extends SubmissionSortQueryDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
