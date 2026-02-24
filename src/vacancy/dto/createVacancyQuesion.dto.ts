@ -1 +1,4 @@
// Legacy shim file kept due to the misspelled filename `createVacancyQuesion.dto.ts`.
// TODO: Implement the real DTO in `createVacancyQuestion.dto.ts` and update all imports
// to use that file directly, then remove this shim.
export * from './createVacancyQuestion.dto';
import { ConvertStringToBool } from '../../decorators/convertStringToBool.decorator';

export class CreateVacancyQuestionDto {
  @IsNotEmpty()
  @ConvertStringToBool()
  @IsBoolean()
  isRequired: boolean;
}
