import { CandidateProfile } from '../entities/candidateProfile';
import {
  LanguageLevelRank,
  LanguageProficiency,
} from '../entities/hiring.enum';
import { CandidateProfileFilterDto } from '../candidateProfile/dto/candidateProfileFilter.dto';
import {
  QuestionAnswerFilterEntry,
  VacancySubmissionFilterDto,
} from '../vacancySubmission/dto/vacancySubmissionFilter.dto';
import { VacancySubmission } from '../entities/vacancySubmission';
import { SelectQueryBuilder } from 'typeorm';

type CommonFilterDto = CandidateProfileFilterDto | VacancySubmissionFilterDto;

export const filterByExperience = (
  query: SelectQueryBuilder<any>,
  filterDto: CommonFilterDto,
) => {
  if (filterDto?.minYearsOfExperience) {
    query.andWhere(
      'candidateProfile.years_of_experience >= :minYearsOfExperience',
      {
        minYearsOfExperience: filterDto.minYearsOfExperience,
      },
    );
  }

  if (filterDto?.maxYearsOfExperience != null) {
    query.andWhere(
      'candidateProfile.years_of_experience <= :maxYearsOfExperience',
      {
        maxYearsOfExperience: filterDto.maxYearsOfExperience,
      },
    );
  }

  return query;
};

export const filterByCountriesCities = (
  query: SelectQueryBuilder<any>,
  filterDto: CommonFilterDto,
) => {
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

/** Candidate & Submission must meet every requirement 
  Example: "languages": [{ "code": "es", "level": "B1" }, { "code": "en", "level": "NATIVE"} ] 
  -> candidate must have at least B1 in Spanish and be native in English to pass the filter
*/
export const filterByLanguages = (
  candidates: CandidateProfile[],
  filterDto: CommonFilterDto,
) => {
  if (!filterDto?.languages?.length) return candidates;

  return candidates.filter((c) =>
    filterDto?.languages?.every((requiredLang) =>
      meetsLanguageRequirement(c.languages, requiredLang),
    ),
  );
};

/** Checks whether a submission has an answer that matches a filter criterion */
export const filterByAnswers = (
  submissions: VacancySubmission[],
  questionAnswerPair: QuestionAnswerFilterEntry[],
): VacancySubmission[] => {
  return submissions.filter((submission) => {
    const submissionAnswers = submission.answers ?? [];

    return questionAnswerPair.every((pair) => {
      if (pair.value) {
        return submissionAnswers.some((a) => {
          if (a.questionId !== pair.questionId) return false;

          //  Array-to-array comparison (dropdown) — If both the filter value and the answer are arrays,
          // check that every value the filter requires is present in the candidate's answer.
          // E.g., filter ['Bachelor', 'Master'] matches answer ['Bachelor', 'Master', 'PhD'] but not ['Bachelor'].
          if (Array.isArray(pair.value) && Array.isArray(a.value)) {
            return pair.value.every((v) => (a.value as string[]).includes(v));
          }
          return a.value === pair.value;
        });
      }
      return submissionAnswers.some((a) => a.questionId === pair.questionId);
    });
  });
};

/** Checks whether a candidate satisfies a single requirement. */
export const meetsLanguageRequirement = (
  candidateLangs: LanguageProficiency[],
  required: LanguageProficiency,
): boolean => {
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
