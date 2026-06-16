import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class SubmissionRatingDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(10)
  rating: number;
}
