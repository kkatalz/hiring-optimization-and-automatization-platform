import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ConvertStringToBool } from '../../decorators/convertStringToBool.decorator';

export class CreateVacancyQuestionDto {
  @IsNotEmpty()
  @ConvertStringToBool()
  @IsBoolean()
  isRequired: boolean;
}
