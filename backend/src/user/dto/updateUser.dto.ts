import { IsOptional } from 'class-validator';
import {
  FIRST_NAME_MAX_LENGTH,
  IsValidName,
  LAST_NAME_MAX_LENGTH,
} from '../../decorators/isValidName.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsValidName(FIRST_NAME_MAX_LENGTH)
  firstName?: string;

  @IsOptional()
  @IsValidName(LAST_NAME_MAX_LENGTH)
  lastName?: string;
}
