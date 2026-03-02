import { IsNotEmpty, IsNumber } from 'class-validator';

export class SubmissionRatingDto {
  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
