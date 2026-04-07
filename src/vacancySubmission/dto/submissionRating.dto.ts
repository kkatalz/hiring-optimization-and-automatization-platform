import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class SubmissionRatingDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;
}
