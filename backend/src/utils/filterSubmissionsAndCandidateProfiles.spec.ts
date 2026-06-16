import { expect } from 'chai';
import { CandidateProfile } from '../entities/candidateProfile';
import { LanguageLevel } from '../entities/hiring.enum';
import { VacancySubmission } from '../entities/vacancySubmission';
import {
  filterByLanguages,
  filterByAnswers,
  meetsLanguageRequirement,
} from './filterSubmissionsAndCandidateProfiles';

describe('filterSubmissionsAndCandidateProfiles utils', () => {
  describe('meetsLanguageRequirement', () => {
    it('should return true when candidate has exact language code and level', () => {
      const result = meetsLanguageRequirement(
        [{ code: 'en', level: LanguageLevel.B2 }],
        { code: 'en', level: LanguageLevel.B2 },
      );
      expect(result).to.equal(true);
    });

    it('should return true when candidate exceeds required level', () => {
      const result = meetsLanguageRequirement(
        [{ code: 'en', level: LanguageLevel.C1 }],
        { code: 'en', level: LanguageLevel.B2 },
      );
      expect(result).to.equal(true);
    });

    it('should return false when candidate level is below required', () => {
      const result = meetsLanguageRequirement(
        [{ code: 'en', level: LanguageLevel.A1 }],
        { code: 'en', level: LanguageLevel.B2 },
      );
      expect(result).to.equal(false);
    });

    it('should return true when only code is required and candidate has it at any level', () => {
      const result = meetsLanguageRequirement(
        [{ code: 'en', level: LanguageLevel.A1 }],
        { code: 'en' },
      );
      expect(result).to.equal(true);
    });

    it('should return false when candidate does not have the required language code', () => {
      const result = meetsLanguageRequirement(
        [{ code: 'de', level: LanguageLevel.C1 }],
        { code: 'en' },
      );
      expect(result).to.equal(false);
    });

    it('should return true when only level is required and candidate has any language at that level', () => {
      const result = meetsLanguageRequirement(
        [{ code: 'de', level: LanguageLevel.C1 }],
        { level: LanguageLevel.B2 },
      );
      expect(result).to.equal(true);
    });
  });

  describe('filterByLanguages — AND logic', () => {
    const candidates: CandidateProfile[] = [
      {
        id: '1',
        languages: [{ code: 'en', level: LanguageLevel.NATIVE }],
      } as CandidateProfile,
      {
        id: '2',
        languages: [
          { code: 'en', level: LanguageLevel.C1 },
          { code: 'de', level: LanguageLevel.B1 },
          { code: 'fr', level: LanguageLevel.A2 },
        ],
      } as CandidateProfile,
    ];

    it('should return candidates who meet ALL language requirements', () => {
      const result = filterByLanguages(candidates, {
        languages: [{ code: 'en' }, { code: 'de' }],
      });

      // Only candidate 2 has both en and de
      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal('2');
    });

    it('should return empty when no candidate meets all requirements', () => {
      const result = filterByLanguages(candidates, {
        languages: [{ code: 'en' }, { code: 'es' }],
      });

      expect(result).to.deep.equal([]);
    });

    it('should return all candidates when single language requirement is met by all', () => {
      const result = filterByLanguages(candidates, {
        languages: [{ code: 'en' }],
      });

      expect(result.length).to.equal(2);
    });

    it('should return all candidates when no languages filter is provided', () => {
      const result = filterByLanguages(candidates, {});

      expect(result.length).to.equal(2);
    });

    it('should check level for each required language independently', () => {
      // Require en at C1+ and de at B2+
      // Candidate 2 has en/C1 (meets) and de/B1 (below B2 — fails)
      const result = filterByLanguages(candidates, {
        languages: [
          { code: 'en', level: LanguageLevel.C1 },
          { code: 'de', level: LanguageLevel.B2 },
        ],
      });

      expect(result).to.deep.equal([]);
    });
  });

  describe('filterByAnswers', () => {
    const submissions = [
      {
        id: 'sub1',
        answers: [
          { questionId: 'q1', value: 'true' },
          { questionId: 'q2', value: ['Bachelor'] },
        ],
      },
      {
        id: 'sub2',
        answers: [
          { questionId: 'q1', value: 'false' },
          { questionId: 'q2', value: ['Master', 'PhD'] },
        ],
      },
    ] as unknown as VacancySubmission[];

    it('should filter by single answer value', () => {
      const result = filterByAnswers(submissions, [
        { questionId: 'q1', value: 'true' },
      ]);

      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal('sub1');
    });

    it('should require ALL answer filters to match (AND logic)', () => {
      const result = filterByAnswers(submissions, [
        { questionId: 'q1', value: 'true' },
        { questionId: 'q2', value: ['Master'] },
      ]);

      // sub1 has q1=true but q2=['Bachelor'] (no Master), so no match
      expect(result).to.deep.equal([]);
    });

    it('should match dropdown array-to-array: filter values must be subset of answer', () => {
      const result = filterByAnswers(submissions, [
        { questionId: 'q2', value: ['Master'] },
      ]);

      // sub2 has q2=['Master', 'PhD'] which includes 'Master'
      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal('sub2');
    });

    it('should return submissions when filtering by questionId only (no value)', () => {
      const result = filterByAnswers(submissions, [{ questionId: 'q1' }]);

      // Both submissions have q1
      expect(result.length).to.equal(2);
    });
  });
});
