import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

export class PaginationQueryDto {
  /**
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /**
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginates an in-memory array. Use when SQL-level pagination is not possible
 * (e.g. after in-memory filtering/sorting).
 */
export function paginateArray<T>(
  items: T[],
  page?: number,
  limit?: number,
): PaginatedResponse<T> {
  const p = page ?? DEFAULT_PAGE;
  const l = limit ?? DEFAULT_LIMIT;
  const start = (p - 1) * l;

  return toPaginatedResponse(items.slice(start, start + l), items.length, p, l);
}

/**
 * Wraps a [data, count] tuple (from TypeORM's findAndCount / getManyAndCount)
 * into a PaginatedResponse.
 */
export function toPaginatedResponse<T>(
  data: T[], // data.length - the slice for the current page (e.g. 20)
  total: number, // items.length - the full unsliced array (e.g. 50 vacancies)
  page?: number,
  limit?: number,
): PaginatedResponse<T> {
  const p = page ?? DEFAULT_PAGE;
  const l = limit ?? DEFAULT_LIMIT;
  const totalPages = Math.ceil(total / l);

  return { data, total, page: p, limit: l, totalPages };
}
