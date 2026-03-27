import { SalaryRange } from '../types/salaryRange.interface';

/**
 * If salary is a range like "50_000-70_000", extract min and max as numbers.
 * If it's a single value like "60_000", treat it as min=max=60,000.
 */
export function parseSalaryRange(salary?: string): SalaryRange | null {
  if (!salary) return null;
  const nums = salary
    .match(/[\d,]+\.?\d*/g)
    ?.map((s) => parseFloat(s.replace(/,/g, '')))
    .filter((n) => !isNaN(n));
  if (!nums?.length) return null;
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}
