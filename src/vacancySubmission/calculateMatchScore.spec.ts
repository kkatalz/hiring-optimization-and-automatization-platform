import { expect } from 'chai';
import { VacancySubmissionService } from './vacancySubmission.service';
import { MatchScoreOptions } from './types/matchingScore.interface';
import { QuestionType } from '../entities/question.enum';
import { VacancyQuestionDetailedDto } from '../vacancy/dto/vacancyQuestionDetailed.dto';
import { QuestionAnswerAllRequiredDto } from './dto/createVacancySubmission.dto';
import { LanguageLevel } from '../entities/hiring.enum';

describe('calculateMatchScore (unit)', () => {
  let service: VacancySubmissionService;

  beforeEach(() => {
    // calculateMatchScore only uses this.logger and this.parseSalaryRange (private),
    // so we can create a minimal instance with null deps
    service = new (VacancySubmissionService as any)(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );
  });

  // --- Helpers ---
  const boolQuestion = (
    questionId: string,
    expectedValue: string,
    priority = 1,
  ): VacancyQuestionDetailedDto => ({
    vacancyId: 'v1',
    questionId,
    isRequired: true,
    priority,
    expectedValue,
    label: `Bool Q ${questionId}`,
    type: QuestionType.boolean,
    answerOptions: null,
  });

  const dropdownQuestion = (
    questionId: string,
    expectedValue: string[],
    answerOptions: string[],
    priority = 1,
  ): VacancyQuestionDetailedDto => ({
    vacancyId: 'v1',
    questionId,
    isRequired: true,
    priority,
    expectedValue,
    label: `Dropdown Q ${questionId}`,
    type: QuestionType.dropdown,
    answerOptions,
  });

  const textQuestion = (questionId: string): VacancyQuestionDetailedDto => ({
    vacancyId: 'v1',
    questionId,
    isRequired: false,
    priority: 1,
    label: `Text Q ${questionId}`,
    type: QuestionType.text,
    answerOptions: null,
  });

  const answer = (
    questionId: string,
    value: string | string[],
  ): QuestionAnswerAllRequiredDto => ({ questionId, value });

  // --- Questions-only scoring ---

  describe('questions only (no options)', () => {
    it('should return 100 when all boolean questions match', () => {
      const questions = [
        boolQuestion('q1', 'true'),
        boolQuestion('q2', 'true'),
      ];
      const answers = [answer('q1', 'true'), answer('q2', 'true')];

      const score = service.calculateMatchScore(answers, questions);

      expect(score).to.equal(100);
    });

    it('should return 0 when no answers match', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'false')];

      const score = service.calculateMatchScore(answers, questions);

      expect(score).to.equal(0);
    });

    it('should return weighted partial score for mixed matches', () => {
      // q1: priority 1 (weight=1), match; q2: priority 2 (weight=0.5), no match
      // ratio = (1*1 + 0.5*0) / (1 + 0.5) = 1/1.5 = 0.6667
      // normalized: 0.6667 * 100 = 66.67
      const questions = [
        boolQuestion('q1', 'true', 1),
        boolQuestion('q2', 'true', 2),
      ];
      const answers = [answer('q1', 'true'), answer('q2', 'false')];

      const score = service.calculateMatchScore(answers, questions);

      expect(score).to.equal(66.67);
    });

    it('should return 0 when no scorable questions exist', () => {
      const questions = [textQuestion('q1')];
      const answers = [answer('q1', 'some text')];

      const score = service.calculateMatchScore(answers, questions);

      expect(score).to.equal(0);
    });

    it('should return 100 + bonus for dropdown with all expected matched + extras', () => {
      const questions = [dropdownQuestion('q1', ['A'], ['A', 'B', 'C'], 1)];
      const answers = [answer('q1', ['A', 'B'])];

      const score = service.calculateMatchScore(answers, questions);

      // ratio = 1 (100% match), bonus = 1 extra option selected
      expect(score).to.equal(101);
    });
  });

  // --- Tags scoring ---

  describe('tags only (no questions)', () => {
    it('should return 100 when all vacancy tags are matched', () => {
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: ['React', 'Node'],
      };

      const score = service.calculateMatchScore([], [], options);

      expect(score).to.equal(100);
    });

    it('should return proportional score for partial tag match', () => {
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node', 'Python', 'SQL'],
        submissionTags: ['React', 'Node'],
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 2/4 = 0.5 → 50
      expect(score).to.equal(50);
    });

    it('should give bonus for extra custom tags beyond vacancy list', () => {
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: ['React', 'Node', 'Vue', 'Docker'],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100 (2/2 matched), bonus = +2 (2 extra tags)
      expect(score).to.equal(102);
    });

    it('should return 0 when no submission tags', () => {
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: [],
      };

      const score = service.calculateMatchScore([], [], options);

      expect(score).to.equal(0);
    });
  });

  // --- Languages scoring ---

  describe('languages only (no questions)', () => {
    it('should return 100 when all required languages met at exact level', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [
          { code: 'en', level: LanguageLevel.B2 },
          { code: 'fr', level: LanguageLevel.A2 },
        ],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.B2 },
          { code: 'fr', level: LanguageLevel.A2 },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      expect(score).to.equal(100);
    });

    it('should give level bonus when candidate exceeds required level', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.C2 }, // 2 levels above B2 (C1, C2)
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100 (1/1), levelBonus = +2
      expect(score).to.equal(102);
    });

    it('should give extra language bonus (max +3)', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.B2 },
          { code: 'fr', level: LanguageLevel.A1 },
          { code: 'de', level: LanguageLevel.A1 },
          { code: 'es', level: LanguageLevel.A1 },
          { code: 'it', level: LanguageLevel.A1 },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, extra langs = 4 but capped at +3
      expect(score).to.equal(103);
    });

    it('should return proportional score when some required languages not met', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [
          { code: 'en', level: LanguageLevel.B2 },
          { code: 'fr', level: LanguageLevel.B2 },
        ],
        candidateLanguages: [{ code: 'en', level: LanguageLevel.C1 }],
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 1/2 = 0.5 → base 50, levelBonus = +1 (C1 is 1 above B2)
      expect(score).to.equal(51);
    });

    it('should return 0 when candidate has none of the required languages', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [{ code: 'de', level: LanguageLevel.C2 }],
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 0/1 → base 0, extraLangs = +1 (de not in requirements)
      expect(score).to.equal(1);
    });

    it('should not count language if candidate level is below required', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.C1 }],
        candidateLanguages: [{ code: 'en', level: LanguageLevel.A2 }],
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 0/1 → 0
      expect(score).to.equal(0);
    });
  });

  // --- Experience scoring ---

  describe('experience only (no questions)', () => {
    it('should return 100 when candidate meets exactly required years', () => {
      const options: MatchScoreOptions = {
        vacancyRequiredYearsOfExperience: 5,
        candidateYearsOfExperience: 5,
      };

      const score = service.calculateMatchScore([], [], options);

      expect(score).to.equal(100);
    });

    it('should return 100 + bonus for extra years (max +5)', () => {
      const options: MatchScoreOptions = {
        vacancyRequiredYearsOfExperience: 3,
        candidateYearsOfExperience: 10,
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, extraYears = 7 but capped at +5
      expect(score).to.equal(105);
    });

    it('should return proportional score when candidate has fewer years', () => {
      const options: MatchScoreOptions = {
        vacancyRequiredYearsOfExperience: 10,
        candidateYearsOfExperience: 5,
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 5/10 = 0.5 → 50
      expect(score).to.equal(50);
    });

    it('should return 0 when candidate has 0 years', () => {
      const options: MatchScoreOptions = {
        vacancyRequiredYearsOfExperience: 5,
        candidateYearsOfExperience: 0,
      };

      const score = service.calculateMatchScore([], [], options);

      expect(score).to.equal(0);
    });
  });

  // --- Salary scoring ---

  describe('salary only (no questions)', () => {
    it('should return 100 + bonus when salary is at budget minimum', () => {
      const options: MatchScoreOptions = {
        vacancySalary: '1000-2000 USD',
        expectedSalary: 1000,
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100 (within budget), bonus = (2000-1000)/(2000-1000)*3 = 3
      expect(score).to.equal(103);
    });

    it('should return 100 when salary is exactly at budget max', () => {
      const options: MatchScoreOptions = {
        vacancySalary: '1000-2000 USD',
        expectedSalary: 2000,
      };

      const score = service.calculateMatchScore([], [], options);

      // within budget, no bonus (at max)
      expect(score).to.equal(100);
    });

    it('should return 100 + proportional bonus within range', () => {
      const options: MatchScoreOptions = {
        vacancySalary: '1000-2000 USD',
        expectedSalary: 1500,
      };

      const score = service.calculateMatchScore([], [], options);

      // bonus = (2000-1500)/(2000-1000)*3 = 1.5
      expect(score).to.equal(101.5);
    });

    it('should return 0 when salary is over budget', () => {
      const options: MatchScoreOptions = {
        vacancySalary: '1000-2000 USD',
        expectedSalary: 3000,
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 0 (over budget)
      expect(score).to.equal(0);
    });

    it('should handle single salary value', () => {
      const options: MatchScoreOptions = {
        vacancySalary: '2000 USD',
        expectedSalary: 1500,
      };

      const score = service.calculateMatchScore([], [], options);

      // min=max=2000, expectedSalary <= 2000 → ratio=1, bonus=2 (single-value bonus)
      expect(score).to.equal(102);
    });

    it('should return 0 for unparseable salary text', () => {
      const options: MatchScoreOptions = {
        vacancySalary: 'competitive',
        expectedSalary: 1500,
      };

      const score = service.calculateMatchScore([], [], options);

      // salary range not parseable → salary component skipped
      expect(score).to.equal(0);
    });
  });

  // --- Combined all dimensions ---

  describe('all dimensions combined', () => {
    const allQuestions = [
      boolQuestion('q1', 'true', 1),
      dropdownQuestion(
        'q2',
        ['Bachelor'],
        ['High School', 'Bachelor', 'Master', 'PhD'],
        2,
      ),
    ];

    it('should return exactly 100 when all requirements met perfectly', () => {
      const answers = [answer('q1', 'true'), answer('q2', ['Bachelor'])];
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: ['React', 'Node'],
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [{ code: 'en', level: LanguageLevel.B2 }],
        vacancyRequiredYearsOfExperience: 3,
        candidateYearsOfExperience: 3,
        vacancySalary: '1000-2000 USD',
        expectedSalary: 2000, // at max, no salary bonus
      };

      const score = service.calculateMatchScore(answers, allQuestions, options);

      expect(score).to.equal(100);
    });

    it('should exceed 100 when candidate has extras on all dimensions', () => {
      const answers = [
        answer('q1', 'true'),
        answer('q2', ['Bachelor', 'Master']),
      ]; // +1 dropdown bonus
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: ['React', 'Node', 'Vue'], // +1 extra tag
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.C1 }, // +1 level bonus
          { code: 'fr', level: LanguageLevel.A1 }, // +1 extra lang
        ],
        vacancyRequiredYearsOfExperience: 3,
        candidateYearsOfExperience: 5, // +2 extra years
        vacancySalary: '1000-2000 USD',
        expectedSalary: 1000, // +3 salary bonus
      };

      const score = service.calculateMatchScore(answers, allQuestions, options);

      // base = 100 (all met), bonuses: 1 + 1 + 1 + 1 + 2 + 3 = 9
      expect(score).to.equal(109);
    });

    it('should be below 100 when some requirements are not met', () => {
      const answers = [answer('q1', 'false'), answer('q2', ['PhD'])]; // 0% questions
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node', 'Python'],
        submissionTags: ['React'], // 1/3 tags
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.C1 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.A2 }, // not met
        ],
        vacancyRequiredYearsOfExperience: 10,
        candidateYearsOfExperience: 3, // 3/10
        vacancySalary: '1000-2000 USD',
        expectedSalary: 5000, // over budget
      };

      const score = service.calculateMatchScore(answers, allQuestions, options);

      // questions: 0% * 60/100 = 0
      // tags: 1/3 * 15/100 = 5
      // languages: 0/1 * 15/100 = 0
      // experience: 3/10 * 5/100 = 1.5
      // salary: 0 * 5/100 = 0
      // totalWeight = 100, base = (0 + 5 + 0 + 1.5 + 0)/100*100 = 6.5
      expect(score).to.equal(6.5);
    });
  });

  // --- Dynamic weight redistribution ---

  describe('weight redistribution', () => {
    it('should normalize to 100 with only questions', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];

      const score = service.calculateMatchScore(answers, questions);

      // Only questions (weight 60), totalWeight = 60
      // base = (1 * 60) / 60 * 100 = 100
      expect(score).to.equal(100);
    });

    it('should normalize to 100 with only tags', () => {
      const options: MatchScoreOptions = {
        vacancyTags: ['A', 'B'],
        submissionTags: ['A', 'B'],
      };

      const score = service.calculateMatchScore([], [], options);

      // Only tags (weight 15), totalWeight = 15
      // base = (1 * 15) / 15 * 100 = 100
      expect(score).to.equal(100);
    });

    it('should normalize to 100 with questions + tags when all match', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyTags: ['React'],
        submissionTags: ['React'],
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // questions weight=60, tags weight=15, totalWeight=75
      // base = (1*60 + 1*15) / 75 * 100 = 100
      expect(score).to.equal(100);
    });

    it('should give higher weight to questions when combined with tags', () => {
      // Questions 100% match, tags 0% match
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: [], // 0 tags matched
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // totalWeight = 60 + 15 = 75
      // base = (1*60 + 0*15) / 75 * 100 = 80
      expect(score).to.equal(80);
    });

    it('should return 0 when no applicable dimensions exist', () => {
      const score = service.calculateMatchScore([], []);

      expect(score).to.equal(0);
    });

    it('should return 0 when only text questions exist (no scorable dimensions)', () => {
      const questions = [textQuestion('q1')];
      const answers = [answer('q1', 'some text')];

      const score = service.calculateMatchScore(answers, questions);

      expect(score).to.equal(0);
    });
  });

  // --- Edge cases ---

  describe('edge cases', () => {
    it('should handle salary with comma-formatted numbers', () => {
      const options: MatchScoreOptions = {
        vacancySalary: '1,000-2,000 USD',
        expectedSalary: 1500,
      };

      const score = service.calculateMatchScore([], [], options);

      // parsed as 1000-2000, bonus = (2000-1500)/(2000-1000)*3 = 1.5
      expect(score).to.equal(101.5);
    });

    it('should handle dropdown with partial expected value match', () => {
      const questions = [
        dropdownQuestion('q1', ['A', 'B'], ['A', 'B', 'C', 'D'], 1),
      ];
      const answers = [answer('q1', ['A'])]; // 1/2 expected matched

      const score = service.calculateMatchScore(answers, questions);

      // ratio = 0.5, base = 50
      expect(score).to.equal(50);
    });

    it('should cap experience bonus at +5', () => {
      const options: MatchScoreOptions = {
        vacancyRequiredYearsOfExperience: 1,
        candidateYearsOfExperience: 20,
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, extraYears = 19 but capped at +5
      expect(score).to.equal(105);
    });

    it('should cap extra language bonus at +3', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.A1 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.A1 },
          { code: 'fr', level: LanguageLevel.A1 },
          { code: 'de', level: LanguageLevel.A1 },
          { code: 'es', level: LanguageLevel.A1 },
          { code: 'it', level: LanguageLevel.A1 },
          { code: 'pt', level: LanguageLevel.A1 },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, 5 extra langs but capped at +3
      expect(score).to.equal(103);
    });

    it('should cap salary bonus at +3', () => {
      const options: MatchScoreOptions = {
        vacancySalary: '1000-2000 USD',
        expectedSalary: 0, // way below min
      };

      const score = service.calculateMatchScore([], [], options);

      // bonus = (2000-0)/(2000-1000)*3 = 6, capped at 3
      expect(score).to.equal(103);
    });

    it('should handle NATIVE language level as highest', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.NATIVE }, // B2→C1→C2→NATIVE = 3 levels above
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, levelBonus = +3 (NATIVE is index 6, B2 is index 3)
      expect(score).to.equal(103);
    });
  });
});
