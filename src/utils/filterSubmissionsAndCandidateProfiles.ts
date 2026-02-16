import { CandidateProfile } from '../entities/candidateProfile';
import {
  LanguageLevelRank,
  LanguageProficiency,
} from '../entities/hiring.enum';
import { RecruitingFilterDto } from '../recruiting/recruitingFilter.dto';
import { SelectQueryBuilder } from 'typeorm';

export const filterByExperienceCountriesCities = (
  query: SelectQueryBuilder<any>,
  filterDto: RecruitingFilterDto,
) => {
  if (filterDto?.minYearsOfExperience) {
    query.andWhere(
      'candidateProfile.years_of_experience >= :minYearsOfExperience',
      {
        minYearsOfExperience: filterDto.minYearsOfExperience,
      },
    );
  }

  if (filterDto?.maxYearsOfExperience) {
    query.andWhere(
      'candidateProfile.years_of_experience <= :maxYearsOfExperience',
      {
        maxYearsOfExperience: filterDto.maxYearsOfExperience,
      },
    );
  }

  if (filterDto?.countries && filterDto.countries.length > 0) {
    query.andWhere('candidateProfile.country = ANY(:countries)', {
      countries: filterDto.countries,
    });
  }

  if (filterDto?.cities && filterDto.cities.length > 0) {
    query.andWhere('candidateProfile.city = ANY(:cities)', {
      cities: filterDto.cities,
    });
  }

  return query;
};

export const filterByLanguages = (
  candidates: CandidateProfile[],
  filterDto: RecruitingFilterDto,
) => {
  if (!filterDto?.languages?.length) return candidates;

  return candidates.filter((c) =>
    filterDto?.languages?.some((requiredLang) =>
      meetsLanguageRequirement(c.languages, requiredLang),
    ),
  );
};

export const meetsLanguageRequirement = (
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
