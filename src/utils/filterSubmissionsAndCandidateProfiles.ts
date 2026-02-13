import { CandidateProfile } from 'src/entities/candidateProfile';
import {
  LanguageLevelRank,
  LanguageProficiency,
} from 'src/entities/hiring.enum';
import { RecruitingFilterDto } from 'src/recruiting/recruitingFilter.dto';
import { SelectQueryBuilder } from 'typeorm';

export const filterByExperienceountriesCities = (
  query: SelectQueryBuilder<any>,
  profileFilterDto: RecruitingFilterDto,
) => {
  if (profileFilterDto?.minYearsOfExperience) {
    query.andWhere(
      'candidateProfile.years_of_experience >= :minYearsOfExperience',
      {
        minYearsOfExperience: profileFilterDto.minYearsOfExperience,
      },
    );
  }

  if (profileFilterDto?.maxYearsOfExperience) {
    query.andWhere(
      'candidateProfile.years_of_experience <= :maxYearsOfExperience',
      {
        maxYearsOfExperience: profileFilterDto.maxYearsOfExperience,
      },
    );
  }

  if (profileFilterDto?.countries && profileFilterDto.countries.length > 0) {
    query.andWhere('candidateProfile.country = ANY(:countries)', {
      countries: profileFilterDto.countries,
    });
  }

  if (profileFilterDto?.cities && profileFilterDto.cities.length > 0) {
    query.andWhere('candidateProfile.city = ANY(:cities)', {
      cities: profileFilterDto.cities,
    });
  }

  return query;
};

export const filterByLanguages = (
  candidates: CandidateProfile[],
  profileFilterDto: RecruitingFilterDto,
) => {
  if (profileFilterDto?.languages?.length) {
    return candidates.filter((c) =>
      profileFilterDto?.languages?.some((requiredLang) =>
        meetsLanguageRequirement(c.languages, requiredLang),
      ),
    );
  }
};

const meetsLanguageRequirement = (
  candidateLangs: LanguageProficiency[],
  required: LanguageProficiency,
): boolean => {
  /** three scenarios for language filtering:
   *1) when code and level are provided, return candidates that match at least one of these languageProficiency requirement (code and level), where
   level equal or higher than provided
   *2) when only code is provided, return candidates that have this specific code at any level
   *3) when only level is provided, return candidates that have any language at level equal or higher than provided
   **/

  return candidateLangs.some((cl) => {
    if (required.code && cl.code !== required.code) return false;

    if (required.level) {
      if (!cl.level) return false;

      if (
        LanguageLevelRank.indexOf(cl.level) <
        LanguageLevelRank.indexOf(required.level)
      )
        return false;
    }

    return true;
  });
};
