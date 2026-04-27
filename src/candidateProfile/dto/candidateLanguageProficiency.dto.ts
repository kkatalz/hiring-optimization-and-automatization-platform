import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LanguageLevel } from '../../entities/hiring.enum';

/**
 * Stricter shape of a language entry for candidate profiles: both `code` and `level`
 * are required, unlike the shared `LanguageProficiency` (which keeps both optional
 * for use as a vacancy requirement / filter, e.g. "any language at B2+").
 */
export class CandidateLanguageProficiency {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(LanguageLevel)
  level: LanguageLevel;
}
