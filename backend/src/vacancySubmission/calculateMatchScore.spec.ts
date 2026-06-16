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

      // ratio = 2/4 = 0.5 -> 50
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

    it('should give +1 per extra language (uncapped)', () => {
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

      // base = 100, extra langs = 4 -> +4 bonus (no cap)
      expect(score).to.equal(104);
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

      // ratio = 1/2 = 0.5 -> base 50, levelBonus = +1 (C1 is 1 above B2)
      expect(score).to.equal(51);
    });

    it('should return 0 when candidate has none of the required languages', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [{ code: 'de', level: LanguageLevel.C2 }],
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 0/1 -> base 0, extraLangs = +1 (de not in requirements)
      expect(score).to.equal(1);
    });

    it('should not count language if candidate level is below required', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.C1 }],
        candidateLanguages: [{ code: 'en', level: LanguageLevel.A2 }],
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 0/1 -> 0
      expect(score).to.equal(0);
    });

    it('should keep highest level when candidate has duplicate code entries', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.C1 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.A1 },
          { code: 'en', level: LanguageLevel.C2 },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100 (1/1 met via C2), levelBonus = +1 (C2 is 1 level above C1)
      expect(score).to.equal(101);
    });

    it('should not add extra-language bonus when codes are duplicateds', () => {
      // fr appears twice; after dedup it counts as a single extra language (+1, not +2).
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.B2 },
          { code: 'fr', level: LanguageLevel.A1 },
          { code: 'fr', level: LanguageLevel.B2 },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, extraLangs = +1 (fr counted once), no level bonus
      expect(score).to.equal(101);
    });

    it('should compute level bonus from the highest duplicate, not the first one', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.A1 },
          { code: 'en', level: LanguageLevel.NATIVE },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, NATIVE is 3 levels above B2 -> levelBonus = +3
      expect(score).to.equal(103);
    });

    it('should keep highest level when candidate has duplicate code entries', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.C1 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.A1 },
          { code: 'en', level: LanguageLevel.C2 },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100 (1/1 met via C2), levelBonus = +1 (C2 is 1 level above C1)
      expect(score).to.equal(101);
    });

    it('should not add extra-language bonus when codes are duplicated', () => {
      // fr appears twice; after dedup it counts as a single extra language (+1, not +2).
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.B2 },
          { code: 'fr', level: LanguageLevel.A1 },
          { code: 'fr', level: LanguageLevel.B2 },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, extraLangs = +1 (fr counted once), no level bonus
      expect(score).to.equal(101);
    });

    it('should compute level bonus from the highest duplicate, not the first one', () => {
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.A1 },
          { code: 'en', level: LanguageLevel.NATIVE },
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, NATIVE is 3 levels above B2 -> levelBonus = +3
      expect(score).to.equal(103);
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

      // ratio = 5/10 = 0.5 -> 50
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
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
        expectedSalary: 1000,
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100 (within budget), bonus = (2000-1000)/(2000-1000)*3 = 3
      expect(score).to.equal(103);
    });

    it('should return 100 when salary is exactly at budget max', () => {
      const options: MatchScoreOptions = {
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
        expectedSalary: 2000,
      };

      const score = service.calculateMatchScore([], [], options);

      // within budget, no bonus (at max)
      expect(score).to.equal(100);
    });

    it('should return 100 + proportional bonus within range', () => {
      const options: MatchScoreOptions = {
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
        expectedSalary: 1500,
      };

      const score = service.calculateMatchScore([], [], options);

      // bonus = (2000-1500)/(2000-1000)*3 = 1.5
      expect(score).to.equal(101.5);
    });

    it('should return 0 when salary is over budget', () => {
      const options: MatchScoreOptions = {
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
        expectedSalary: 3000,
      };

      const score = service.calculateMatchScore([], [], options);

      // ratio = 0 (over budget)
      expect(score).to.equal(0);
    });

    it('should handle single salary value (min === max)', () => {
      const options: MatchScoreOptions = {
        vacancyMinSalary: 2000,
        vacancyMaxSalary: 2000,
        expectedSalary: 1500,
      };

      const score = service.calculateMatchScore([], [], options);

      // min=max=2000, expectedSalary <= 2000 -> ratio=1, bonus=2 (single-value bonus)
      expect(score).to.equal(102);
    });

    it('should return 0 when salary fields are null', () => {
      const options: MatchScoreOptions = {
        vacancyMinSalary: null,
        vacancyMaxSalary: null,
        expectedSalary: 1500,
      };

      const score = service.calculateMatchScore([], [], options);

      // salary range not available -> salary component skipped
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
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
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
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
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
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
        expectedSalary: 5000, // over budget
      };

      const score = service.calculateMatchScore(answers, allQuestions, options);

      // questions: 0% * 50/100 = 0
      // tags: 1/3 * 12/100 = 4
      // languages: 0/1 * 8/100 = 0
      // experience: 3/10 * 20/100 = 6
      // salary: 0 * 10/100 = 0
      // totalWeight = 100, base = (0 + 4 + 0 + 6 + 0)/100*100 = 10
      expect(score).to.equal(10);
    });
  });

  // --- Dynamic weight redistribution ---

  describe('weight redistribution', () => {
    it('should normalize to 100 with only questions', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];

      const score = service.calculateMatchScore(answers, questions);

      // Only questions (weight 50), totalWeight = 50
      // base = (1 * 50) / 50 * 100 = 100
      expect(score).to.equal(100);
    });

    it('should normalize to 100 with only tags', () => {
      const options: MatchScoreOptions = {
        vacancyTags: ['A', 'B'],
        submissionTags: ['A', 'B'],
      };

      const score = service.calculateMatchScore([], [], options);

      // Only tags (weight 12), totalWeight = 12
      // base = (1 * 12) / 12 * 100 = 100
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

      // questions weight=50, tags weight=12, totalWeight=62
      // base = (1*50 + 1*12) / 62 * 100 = 100
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

      // totalWeight = 50 + 12 = 62
      // base = (1*50 + 0*12) / 62 * 100 = 80.65
      expect(score).to.equal(80.65);
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
    it('should handle salary with numeric min/max values', () => {
      const options: MatchScoreOptions = {
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
        expectedSalary: 1500,
      };

      const score = service.calculateMatchScore([], [], options);

      // bonus = (2000-1500)/(2000-1000)*3 = 1.5
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

    it('should not cap extra language bonus (each extra language counts +1)', () => {
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

      // base = 100, 5 extra langs -> +5 bonus (uncapped)
      expect(score).to.equal(105);
    });

    it('should cap salary bonus at +3', () => {
      const options: MatchScoreOptions = {
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
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
          { code: 'en', level: LanguageLevel.NATIVE }, // B2->C1->C2->NATIVE = 3 levels above
        ],
      };

      const score = service.calculateMatchScore([], [], options);

      // base = 100, levelBonus = +3 (NATIVE is index 6, B2 is index 3)
      expect(score).to.equal(103);
    });
  });

  // --- Custom dimension weights ---

  describe('custom dimension weights', () => {
    it('should auto-normalize with custom weights (questions=3, experience=2)', () => {
      // Only questions and experience are applicable
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyRequiredYearsOfExperience: 10,
        candidateYearsOfExperience: 5, // 50% ratio
        customWeights: { questions: 3, experience: 2 },
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // questions: ratio=1, weight=3 -> 1*3 = 3
      // experience: ratio=0.5, weight=2 -> 0.5*2 = 1
      // totalWeight = 5, base = (3 + 1) / 5 * 100 = 80
      expect(score).to.equal(80);
    });

    it('should use defaults for unspecified weights', () => {
      // Only set questions weight; tags should use default 12
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: ['React', 'Node'],
        customWeights: { questions: 30 }, // tags not specified -> default 12
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // questions: ratio=1, weight=30 -> 30
      // tags: ratio=1, weight=12 -> 12
      // totalWeight = 42, base = 42/42*100 = 100
      expect(score).to.equal(100);
    });

    it('should effectively disable a dimension when weight is 0 (no bonus leak)', () => {
      // Experience would produce ratio=1 and bonus=+5 (capped), but weight=0 should exclude it entirely
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyRequiredYearsOfExperience: 3,
        candidateYearsOfExperience: 10, // would give +5 bonus if not excluded
        customWeights: { questions: 60, experience: 0 },
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // experience weight=0 -> dimension skipped entirely (no ratio, no bonus)
      // questions: ratio=1, weight=60 -> base = 60/60*100 = 100, no bonuses
      expect(score).to.equal(100);
    });

    it('should exclude languages entirely when languages weight is 0', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [
          { code: 'en', level: LanguageLevel.C2 }, // would give +2 level bonus
          { code: 'fr', level: LanguageLevel.A1 }, // would give +1 extra lang bonus
        ],
        customWeights: { questions: 50, languages: 0 },
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // languages weight=0 -> skipped, no bonus leak
      // questions: ratio=1, weight=50 -> base = 100
      expect(score).to.equal(100);
    });

    it('should exclude tags entirely when tags weight is 0', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: ['React', 'Node', 'Vue', 'Docker'], // would give +2 extra tag bonus
        customWeights: { questions: 50, tags: 0 },
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // tags weight=0 -> skipped, no bonus leak
      expect(score).to.equal(100);
    });

    it('should exclude salary entirely when salary weight is 0', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
        expectedSalary: 1000, // would give +3 salary bonus
        customWeights: { questions: 50, salary: 0 },
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // salary weight=0 -> skipped, no bonus leak
      expect(score).to.equal(100);
    });

    it('should respect all custom weights proportionally', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')]; // 100% questions
      const options: MatchScoreOptions = {
        vacancyTags: ['React', 'Node'],
        submissionTags: [], // 0% tags
        vacancyLanguageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
        candidateLanguages: [{ code: 'en', level: LanguageLevel.B2 }], // 100% languages
        vacancyRequiredYearsOfExperience: 4,
        candidateYearsOfExperience: 2, // 50% experience
        vacancyMinSalary: 1000,
        vacancyMaxSalary: 2000,
        expectedSalary: 2000, // 100% salary, no bonus
        customWeights: {
          questions: 10,
          tags: 10,
          languages: 10,
          experience: 10,
          salary: 10,
        },
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // All weights equal at 10, totalWeight = 50
      // questions: 1*10 = 10, tags: 0*10 = 0, languages: 1*10 = 10,
      // experience: 0.5*10 = 5, salary: 1*10 = 10
      // base = (10 + 0 + 10 + 5 + 10) / 50 * 100 = 70
      expect(score).to.equal(70);
    });

    it('should still apply bonuses with custom weights', () => {
      const questions = [boolQuestion('q1', 'true')];
      const answers = [answer('q1', 'true')];
      const options: MatchScoreOptions = {
        vacancyRequiredYearsOfExperience: 3,
        candidateYearsOfExperience: 6, // +3 bonus (capped at 5)
        customWeights: { questions: 10, experience: 10 },
      };

      const score = service.calculateMatchScore(answers, questions, options);

      // questions: ratio=1, weight=10
      // experience: ratio=1, weight=10, bonus=3
      // totalWeight = 20, base = (10 + 10)/20*100 = 100, + bonus 3
      expect(score).to.equal(103);
    });
  });
});
