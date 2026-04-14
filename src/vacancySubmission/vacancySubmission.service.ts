import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancyService } from '../vacancy/vacancy.service';
import { CreateVacancySubmissionDto } from './dto/createVacancySubmission.dto';
import { VacancySubmissionDto } from './dto/vacancySubmission.dto';
import { vacancySubmToVacancySubmDto } from './map/vacancySubmission.map';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Vacancy } from '../entities/vacancy';
import { VacancySubmissionStatus } from '../entities/statuses.enum';
import { CandidateProfileService } from '../candidateProfile/candidateProfile.service';
import {
  QuestionAnswerFilterEntry,
  VacancySubmissionFilterDto,
} from './dto/vacancySubmissionFilter.dto';
import {
  filterByAnswers,
  filterByExperience,
  filterByCountriesCities,
  meetsLanguageRequirement,
} from '../utils/filterSubmissionsAndCandidateProfiles';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { CandidateProfile } from '../entities/candidateProfile';
import { QuestionService } from '../question/question.service';
import { QuestionType } from '../entities/question.enum';
import { SubmissionAnswer } from '../entities/submissionAnswers';
import { VacancyQuestionDetailedDto } from '../vacancy/dto/vacancyQuestionDetailed.dto';
import { QuestionDto } from '../question/dto/question.dto';
import { QuestionAnswerAllRequiredDto } from './dto/createVacancySubmission.dto';
import {
  LanguageLevelRank,
  LanguageProficiency,
} from '../entities/hiring.enum';
import {
  CustomWeights,
  MatchScoreOptions,
  ScoreResult,
} from './types/matchingScore.interface';
import { SaplingService } from '../sapling/sapling.service';
import { AiDetectionResult } from '../sapling/types/scores.interface';

@Injectable()
export class VacancySubmissionService {
  private readonly logger = new Logger(VacancySubmissionService.name);

  constructor(
    @InjectRepository(VacancySubmission)
    private readonly vacancySubmissionRepository: Repository<VacancySubmission>,

    @InjectRepository(SubmissionAnswer)
    private readonly submissionAnswerRepository: Repository<SubmissionAnswer>,

    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    @Inject(forwardRef(() => VacancyService))
    private readonly vacancyService: VacancyService,

    private readonly profileService: CandidateProfileService,

    private readonly questionService: QuestionService,

    private readonly saplingService: SaplingService,

    private dataSource: DataSource,
  ) {}

  async findSubmissionsWithAnswersByVacancyId(
    vacancyId: string,
  ): Promise<VacancySubmission[]> {
    const submissions = await this.vacancySubmissionRepository.find({
      where: { vacancyId },
      relations: ['answers', 'candidateProfile'],
    });

    return submissions;
  }

  async findSimilarSubmissions(
    vacancyId: string,
    clusterId: number,
  ): Promise<VacancySubmission[]> {
    const similar = await this.vacancySubmissionRepository.find({
      where: {
        vacancyId,
        clusterId,
      },
      relations: ['candidateProfile', 'candidateProfile.user', 'answers'],
    });

    return similar;
  }

  async create(
    createVacancySubmissionDto: CreateVacancySubmissionDto,
    vacancyId: string,
    userId: string,
  ): Promise<VacancySubmissionDto> {
    const candidate: CandidateProfile =
      await this.profileService.findCandidateByUserId(userId);

    const vacancy: VacancyDto =
      await this.vacancyService.findVacancyById(vacancyId);

    // Allow to create submission only if candidate hasn't already applied
    await this.validateCandidateHasNotAlreadyApplied(vacancyId, candidate);

    // Validate that at least one submission tag matches vacancy tags
    this.validateSubmissionTags(createVacancySubmissionDto, vacancy);

    // Check that candidate responded to each required question in Vacancy
    await this.validateRequiredQuestionsAnswered(
      createVacancySubmissionDto,
      vacancy,
    );

    // Calculate match score based on answers, tags, languages, experience, salary
    const allVacancyQuestions =
      await this.vacancyService.findAllQuestionsByVacancyId(vacancy.id);

    const matchScore = this.calculateMatchScore(
      createVacancySubmissionDto.answers || [],
      allVacancyQuestions,
      {
        candidateLanguages: candidate.languages,
        candidateYearsOfExperience: candidate.yearsOfExperience,
        vacancyLanguageRequirements: vacancy.languageRequirements,
        vacancyRequiredYearsOfExperience: vacancy.requiredYearsOfExperience,
        vacancyTags: vacancy.tags,
        vacancyMinSalary: vacancy.minSalary,
        vacancyMaxSalary: vacancy.maxSalary,
        submissionTags: createVacancySubmissionDto.tags,
        expectedSalary: createVacancySubmissionDto.expectedSalary,
        customWeights: vacancy.customWeights,
      },
    );

    const commentAiPromise: Promise<AiDetectionResult | null> =
      createVacancySubmissionDto.comment?.length &&
      createVacancySubmissionDto.comment.length >= 50
        ? this.saplingService.detectAiContent(
            createVacancySubmissionDto.comment,
          )
        : Promise.resolve(null);

    const resumeAiPromise: Promise<AiDetectionResult | null> =
      createVacancySubmissionDto.resume?.length &&
      createVacancySubmissionDto.resume.length >= 50
        ? this.saplingService.detectAiContent(createVacancySubmissionDto.resume)
        : Promise.resolve(null);

    const [commentAiResult, resumeAiResult] = await Promise.all([
      commentAiPromise,
      resumeAiPromise,
    ]);

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const vacancySubmission = this.vacancySubmissionRepository.create({
          ...createVacancySubmissionDto,
          vacancyId: vacancyId,
          tenantId: vacancy.tenantId,
          candidateId: candidate.id,
          status: VacancySubmissionStatus.pending,
          matchScore,
          commentAiScore: commentAiResult?.score ?? null,
          commentAiSentenceScores: commentAiResult?.sentenceScores ?? null,
          resumeAiScore: resumeAiResult?.score ?? null,
          resumeAiSentenceScores: resumeAiResult?.sentenceScores ?? null,
          vacancy: vacancy,
          candidateProfile: candidate,
        });

        const savedVacancySubmission =
          await transactionalEntityManager.save(vacancySubmission);

        if (createVacancySubmissionDto.answers?.length) {
          const submissionAnswers = createVacancySubmissionDto.answers.map(
            (answer) => {
              return this.submissionAnswerRepository.create({
                submissionId: savedVacancySubmission.id,
                questionId: answer.questionId,
                value: answer.value,
              });
            },
          );
          await transactionalEntityManager.save(submissionAnswers);
        }

        await transactionalEntityManager.update(
          Vacancy,
          { id: vacancyId },
          { needsReclustering: true },
        );

        return vacancySubmToVacancySubmDto(savedVacancySubmission);
      },
    );
  }

  async addRecruiterRating(
    submissionId: string,
    recruiterId: string,
    rating: number,
  ): Promise<VacancySubmissionDto> {
    const submission = await this.findOneById(submissionId);

    if (submission.recruiterRating) {
      throw new BadRequestException(
        'This submission has already been rated by a recruiter. Please use updateRecruiterRating endpoint to change the rating.',
      );
    }

    submission.ratedByRecruiterId = recruiterId;
    submission.recruiterRating = rating;

    const savedSubmission =
      await this.vacancySubmissionRepository.save(submission);

    return vacancySubmToVacancySubmDto(savedSubmission);
  }

  async getTenantIdBySubmissionId(submissionId: string): Promise<string> {
    const submission = await this.findOneById(submissionId);

    return submission.tenantId;
  }

  async updateRecruiterRating(
    submissionId: string,
    recruiterId: string,
    rating: number,
  ): Promise<VacancySubmissionDto> {
    const submission = await this.findOneById(submissionId);

    if (!submission.recruiterRating) {
      throw new BadRequestException(
        'This submission has not been rated by a recruiter yet. Please use addRecruiterRating endpoint to add a rating.',
      );
    }

    submission.ratedByRecruiterId = recruiterId;
    submission.recruiterRating = rating;

    const savedSubmission =
      await this.vacancySubmissionRepository.save(submission);
    return vacancySubmToVacancySubmDto(savedSubmission);
  }

  async removeRecruiterRating(
    submissionId: string,
  ): Promise<VacancySubmissionDto> {
    const submission = await this.findOneById(submissionId);

    submission.ratedByRecruiterId = null;
    submission.recruiterRating = null;

    const savedSubmission =
      await this.vacancySubmissionRepository.save(submission);

    return vacancySubmToVacancySubmDto(savedSubmission);
  }

  async findAllSubmissionsWithinVacancyWithFilters(
    vacancyId: string,
    filterSubmissionsDto?: VacancySubmissionFilterDto,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
  ): Promise<VacancySubmissionDto[]> {
    const query = this.createBaseSubmissionQuery().where(
      'submission.vacancy_id = :vacancyId',
      { vacancyId },
    );

    // Validate that provided answers belong to this vacancy and have valid values
    if (filterSubmissionsDto?.answers?.length) {
      const allVacancyQuestions: VacancyQuestionDetailedDto[] =
        await this.vacancyService.findAllQuestionsByVacancyId(vacancyId);

      this.validateProvidedAnswers(
        filterSubmissionsDto.answers,
        allVacancyQuestions,
      );
    }

    return this.executeFilteredSubmissions(
      query,
      filterSubmissionsDto,
      sortBy,
      order,
    );
  }

  async findAllSubmissionsWithinTenantWithFilters(
    tenantId: string,
    filterSubmissionsDto?: VacancySubmissionFilterDto,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
  ): Promise<VacancySubmissionDto[]> {
    const query = this.createBaseSubmissionQuery().where(
      'submission.tenant_id = :tenantId',
      { tenantId },
    );

    // Validate that provided answers belong to this tenant and have valid values
    if (filterSubmissionsDto?.answers?.length) {
      await this.validateAnswersBelongToTenant(
        filterSubmissionsDto.answers,
        tenantId,
      );
    }
    return this.executeFilteredSubmissions(
      query,
      filterSubmissionsDto,
      sortBy,
      order,
    );
  }

  async approve(submissionId: string): Promise<VacancySubmissionDto> {
    const submission = await this.findOneById(submissionId);

    if (submission.status !== VacancySubmissionStatus.approved)
      submission.status = VacancySubmissionStatus.approved;

    const savedSubmission =
      await this.vacancySubmissionRepository.save(submission);

    return vacancySubmToVacancySubmDto(savedSubmission);
  }

  async reject(submissionId: string): Promise<VacancySubmissionDto> {
    const submission = await this.findOneById(submissionId);

    if (submission.status !== VacancySubmissionStatus.rejected)
      submission.status = VacancySubmissionStatus.rejected;

    const savedSubmission =
      await this.vacancySubmissionRepository.save(submission);

    return vacancySubmToVacancySubmDto(savedSubmission);
  }
  private createBaseSubmissionQuery() {
    return this.vacancySubmissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.vacancy', 'vacancy')
      .leftJoinAndSelect('submission.candidateProfile', 'candidateProfile')
      .leftJoinAndSelect('candidateProfile.user', 'user')
      .leftJoinAndSelect('submission.answers', 'answers');
  }

  private static readonly ALLOWED_SORT_FIELDS = [
    'matchScore',
    'createdAt',
    'expectedSalary',
    'recruiterRating',
    'commentAiScore',
    'resumeAiScore',
  ];

  private async executeFilteredSubmissions(
    query: SelectQueryBuilder<VacancySubmission>,
    filterDto?: VacancySubmissionFilterDto,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
  ): Promise<VacancySubmissionDto[]> {
    if (!filterDto) {
      this.applySorting(query, sortBy, order);
      const submissions = await query.getMany();
      return submissions.map(vacancySubmToVacancySubmDto);
    }

    // Apply QueryBuilder filters (SQL side)
    filterByExperience(query, filterDto);
    filterByCountriesCities(query, filterDto);

    if (filterDto.minSalaryExpectation != null) {
      query.andWhere('submission.expected_salary >= :minSalary', {
        minSalary: filterDto.minSalaryExpectation,
      });
    }

    if (filterDto.maxSalaryExpectation != null) {
      query.andWhere('submission.expected_salary <= :maxSalary', {
        maxSalary: filterDto.maxSalaryExpectation,
      });
    }

    if (filterDto.minMatchScore != null) {
      query.andWhere('submission.match_score >= :minMatchScore', {
        minMatchScore: filterDto.minMatchScore,
      });
    }

    if (filterDto.maxCommentAiScore != null) {
      query.andWhere('submission.comment_ai_score <= :maxCommentAiScore', {
        maxCommentAiScore: filterDto.maxCommentAiScore,
      });
    }

    if (filterDto.maxResumeAiScore != null) {
      query.andWhere('submission.resume_ai_score <= :maxResumeAiScore', {
        maxResumeAiScore: filterDto.maxResumeAiScore,
      });
    }

    this.applySorting(query, sortBy, order);

    let submissions = await query.getMany();

    // Apply In-Memory filters (JS side)
    if (filterDto.answers?.length) {
      submissions = filterByAnswers(submissions, filterDto.answers);
    }

    if (filterDto.languages?.length) {
      submissions = submissions.filter((s) => {
        const languages = s.candidateProfile?.languages;
        return (
          languages &&
          filterDto.languages!.every((req) =>
            meetsLanguageRequirement(languages, req),
          )
        );
      });
    }

    return submissions.map(vacancySubmToVacancySubmDto);
  }

  private applySorting(
    query: SelectQueryBuilder<VacancySubmission>,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
  ): void {
    if (
      sortBy &&
      VacancySubmissionService.ALLOWED_SORT_FIELDS.includes(sortBy)
    ) {
      const direction = order === 'ASC' || order === 'DESC' ? order : 'DESC';
      query.orderBy(`submission.${sortBy}`, direction, 'NULLS LAST');
    }
  }

  private async validateAnswersBelongToTenant(
    answers: QuestionAnswerFilterEntry[],
    tenantId: string,
  ) {
    await Promise.all(
      answers.map(async (answer) => {
        const question = await this.questionService.findDtoById(
          answer.questionId,
        );
        if (question.tenantId !== tenantId) {
          throw new BadRequestException(
            `Question with id ${answer.questionId} does not belong to tenant with id ${tenantId}. Please provide valid questionIds in filter.`,
          );
        }
        this.validateValueMatchesQuestionType(answer, question);
      }),
    );
  }

  private async validateRequiredQuestionsAnswered(
    createVacancySubmissionDto: CreateVacancySubmissionDto,
    vacancy: VacancyDto,
  ) {
    const allVacancyQuestions: VacancyQuestionDetailedDto[] =
      await this.vacancyService.findAllQuestionsByVacancyId(vacancy.id);

    const answers = createVacancySubmissionDto.answers || [];

    // Exit if no questions exist and no answers provided
    if (answers.length === 0 && allVacancyQuestions.length === 0) {
      createVacancySubmissionDto.answers = [];
      return;
    }

    //  Validate that provided answers belong to this vacancy and have valid values
    this.validateProvidedAnswers(answers, allVacancyQuestions);

    // Ensure all mandatory questions are present
    await this.ensureRequiredQuestionsPresent(answers, allVacancyQuestions);
  }

  private validateProvidedAnswers(
    answers: QuestionAnswerFilterEntry[],
    allVacancyQuestions: VacancyQuestionDetailedDto[],
  ) {
    const validQuestionIds = allVacancyQuestions.map((q) => q.questionId);

    for (const answer of answers) {
      const questionMatch = allVacancyQuestions.find(
        (q) => q.questionId === answer.questionId,
      );

      if (!questionMatch) {
        throw new BadRequestException(
          `Current vacancy does not have question with id: ${answer.questionId}. Valid ids: ${validQuestionIds.join(', ')}`,
        );
      }

      this.validateValueMatchesQuestionType(answer, questionMatch);
    }
  }

  /**
   * Validates that:
   * Value for boolean questions is either 'true' or 'false'
   * Value for dropdown questions is one of the allowed options
   */
  private validateValueMatchesQuestionType(
    answer: QuestionAnswerFilterEntry,
    questionMatch: VacancyQuestionDetailedDto | QuestionDto,
  ) {
    if (questionMatch.type === QuestionType.boolean && answer.value) {
      if (Array.isArray(answer.value)) {
        throw new BadRequestException(
          `Question '${questionMatch.label}' - (ID: ${answer.questionId}) requires a boolean value ('true' or 'false'), not an array`,
        );
      }
      const isInvalidBool = answer.value !== 'true' && answer.value !== 'false';

      if (isInvalidBool) {
        throw new BadRequestException(
          `Question '${questionMatch.label}' - (ID: ${answer.questionId}) requires a boolean value ('true' or 'false'), but received: '${answer.value}'`,
        );
      }
    }

    if (questionMatch.type === QuestionType.text && answer.value) {
      if (Array.isArray(answer.value)) {
        throw new BadRequestException(
          `Question '${questionMatch.label}' - (ID: ${answer.questionId}) requires a text value, not an array`,
        );
      }
    }

    if (
      questionMatch.type === QuestionType.dropdown &&
      questionMatch.answerOptions?.length &&
      answer.value
    ) {
      if (!Array.isArray(answer.value)) {
        throw new BadRequestException(
          `Value for question ${answer.questionId} must be an array of strings`,
        );
      }
      for (const val of answer.value) {
        if (!questionMatch.answerOptions.includes(val)) {
          throw new BadRequestException(
            `Value for question ${answer.questionId} must be one of: ${questionMatch.answerOptions.join(', ')}. Received: '${val}'`,
          );
        }
      }
    }
  }

  private async ensureRequiredQuestionsPresent(
    answers: QuestionAnswerFilterEntry[],
    allVacancyQuestions: VacancyQuestionDetailedDto[],
  ) {
    const requiredQuestions = allVacancyQuestions.filter((q) => q.isRequired);
    if (requiredQuestions.length === 0) return;

    const answeredIds = new Set(answers.map((a) => a.questionId));
    const missingQuestions = requiredQuestions.filter(
      (q) => !answeredIds.has(q.questionId),
    );

    // Fetch all missing details
    if (missingQuestions.length > 0) {
      const missingDetails = await Promise.all(
        missingQuestions.map((q) =>
          this.questionService.findDtoById(q.questionId),
        ),
      );

      throw new BadRequestException({
        message: 'You must answer all required questions.',
        missingRequiredQuestions: missingDetails,
      });
    }
  }

  private async validateCandidateHasNotAlreadyApplied(
    vacancyId: string,
    candidate: CandidateProfile,
  ): Promise<void> {
    const candidateAlreadyApplied =
      await this.vacancySubmissionRepository.count({
        where: {
          vacancyId,
          candidateId: candidate.id,
        },
      });
    if (candidateAlreadyApplied > 0) {
      throw new BadRequestException(
        'You have already applied to this vacancy.',
      );
    }
  }

  /**
   * Validates that at least one submission tag matches a vacancy tag.
   * Candidates can add their own custom tags beyond the vacancy's list.
   */
  private validateSubmissionTags(
    createVacancySubmissionDto: CreateVacancySubmissionDto,
    vacancy: VacancyDto,
  ): void {
    const submissionTags = createVacancySubmissionDto.tags;
    const vacancyTags = vacancy.tags;

    if (!submissionTags?.length || !vacancyTags?.length) return;

    const vacancyTagSet = new Set(vacancyTags);
    const hasAtLeastOneMatch = submissionTags.some((tag) =>
      vacancyTagSet.has(tag),
    );

    if (!hasAtLeastOneMatch) {
      throw new BadRequestException(
        `At least one of your tags must match the vacancy's required tags: ${vacancyTags.join(', ')}.`,
      );
    }
  }

  /**
   * Calculates match score normalized to 100 when all requirements are met.
   * Only exceeds 100 when candidate brings extras (higher language level,
   * extra languages, extra tags, extra experience years, lower salary).
   *
   * Component weights (can be dynamically distributed among applicable dimensions).
   * By default, they are set to: Questions: 50, Tags: 12, Languages: 8, Experience: 20, Salary: 10
   *
   * Base score = sum(ratio * weight) / sum(applicableWeights) * 100
   *   → all requirements met = exactly 100
   *
   * Bonuses (added on top, push above 100):
   *   - Dropdown: +1 per extra selected option beyond expected
   *   - Tags: +1 per extra custom tag beyond vacancy's list
   *   - Languages: +1 per level above required, +1 per extra language (max +3)
   *   - Experience: +1 per extra year (max +5)
   *   - Salary: up to +3 for being below budget max
   */
  calculateMatchScore(
    answers: QuestionAnswerAllRequiredDto[],
    vacancyQuestions: VacancyQuestionDetailedDto[],
    options?: MatchScoreOptions,
  ): number {
    const w: Required<CustomWeights> = {
      questions: options?.customWeights?.questions ?? 50,
      tags: options?.customWeights?.tags ?? 12,
      languages: options?.customWeights?.languages ?? 8,
      experience: options?.customWeights?.experience ?? 20,
      salary: options?.customWeights?.salary ?? 10,
    };

    // When weight for property is 0, matchScore will not include it.
    const results = [
      w.questions > 0
        ? this.scoreQuestions(answers, vacancyQuestions, w.questions)
        : null,
      w.tags > 0
        ? this.scoreTags(options?.vacancyTags, options?.submissionTags, w.tags)
        : null,
      w.languages > 0
        ? this.scoreLanguages(
            options?.vacancyLanguageRequirements,
            options?.candidateLanguages,
            w.languages,
          )
        : null,
      w.experience > 0
        ? this.scoreExperience(
            options?.vacancyRequiredYearsOfExperience,
            options?.candidateYearsOfExperience,
            w.experience,
          )
        : null,
      w.salary > 0
        ? this.scoreSalary(
            options?.vacancyMinSalary,
            options?.vacancyMaxSalary,
            options?.expectedSalary,
            w.salary,
          )
        : null,
    ].filter((r): r is ScoreResult => r !== null);

    // totalWeight is the sum of weights for all applicable scoring dimensions
    const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);

    if (totalWeight === 0) {
      this.logger.log('MatchScore: 0 (no applicable scoring dimensions)');
      return 0;
    }

    // baseScore is the weighted average of how well the candidate meets the requirements, normalized to 100
    // Example: if only questions and tags are applicable (weight 75 total) and candidate meets them at 80% ratio,
    // baseScore = (0.8*60 + 0.8*15)/75*100 = 80.
    const baseScore =
      (results.reduce((sum, r) => sum + r.ratio * r.weight, 0) / totalWeight) *
      100;

    const bonusPoints = results.reduce((sum, r) => sum + r.bonus, 0);

    const totalScore = baseScore + bonusPoints;

    const weightDistribution = results
      .map(
        (r) =>
          `${r.dimension}: ${((r.weight / totalWeight) * 100).toFixed(1)}%`,
      )
      .join(', ');
    const logLines = results.map((r) => `  - ${r.log}`).join('\n');
    this.logger.log(
      `MatchScore: base=${baseScore.toFixed(2)}/100 + bonuses=${bonusPoints.toFixed(2)} = ${totalScore.toFixed(2)}\n  Weight distribution: [${weightDistribution}]\n${logLines}`,
    );

    return Math.round(totalScore * 100) / 100;
  }

  /** Questions component (weight: 50 if not set otherwise). Scores boolean and dropdown questions with expectedValue. */
  private scoreQuestions(
    answers: QuestionAnswerAllRequiredDto[],
    vacancyQuestions: VacancyQuestionDetailedDto[],
    weight: number,
  ): ScoreResult | null {
    const scorable = vacancyQuestions.filter(
      (vq) => vq.type !== QuestionType.text && vq.expectedValue != null,
    );
    if (scorable.length === 0) return null;

    const answerMap = new Map<string, string | string[]>(
      answers.map((a) => [a.questionId, a.value]),
    );

    let weightedSum = 0;
    let weightTotal = 0;
    let bonus = 0;
    const questionDetails: string[] = [];

    for (const vq of scorable) {
      const weight = vq.priority > 0 ? 1 / vq.priority : 1;
      const candidateAnswer = answerMap.get(vq.questionId);

      let isMatch: number;

      if (
        vq.type === QuestionType.dropdown &&
        Array.isArray(vq.expectedValue)
      ) {
        const expected = vq.expectedValue;
        const values: string[] = Array.isArray(candidateAnswer)
          ? candidateAnswer
          : [];

        const matchCount = values.filter((v) => expected.includes(v)).length;
        isMatch = matchCount / expected.length;

        // Bonus: +1 for each additional option selected beyond expected
        if (matchCount === expected.length) {
          const extraOptions = (vq.answerOptions || []).filter(
            (o) => !expected.includes(o),
          );
          bonus += values.filter((v) => extraOptions.includes(v)).length;
        }
      } else if (
        vq.type === QuestionType.dropdown &&
        typeof vq.expectedValue === 'string'
      ) {
        const values: string[] = Array.isArray(candidateAnswer)
          ? candidateAnswer
          : candidateAnswer
            ? [candidateAnswer]
            : [];

        isMatch = values.includes(vq.expectedValue) ? 1 : 0;

        // Bonus: +1 for each additional option selected beyond the single expected
        if (isMatch) {
          const extraOptions = (vq.answerOptions || []).filter(
            (o) => o !== vq.expectedValue,
          );
          bonus += values.filter((v) => extraOptions.includes(v)).length;
        }
      } else {
        // Normalize both sides to string for comparison (jsonb may return array for single values)
        const normExpected = Array.isArray(vq.expectedValue)
          ? vq.expectedValue[0]
          : vq.expectedValue;
        const normAnswer = Array.isArray(candidateAnswer)
          ? candidateAnswer[0]
          : candidateAnswer;

        isMatch = normAnswer === normExpected ? 1 : 0;
      }

      const answered = Array.isArray(candidateAnswer)
        ? candidateAnswer.join(', ')
        : (candidateAnswer ?? 'N/A');
      const expected = Array.isArray(vq.expectedValue)
        ? vq.expectedValue.join(', ')
        : String(vq.expectedValue);
      questionDetails.push(
        `"${vq.label}": expected=[${expected}] answered=[${answered}] match=${isMatch}`,
      );

      weightedSum += weight * isMatch;
      weightTotal += weight;
    }

    const ratio = weightedSum / weightTotal;
    return {
      dimension: 'Questions',
      ratio,
      weight,
      bonus,
      log: `Questions: ${(ratio * 100).toFixed(1)}% match (bonus: +${bonus} with provided weight - ${weight}) { ${questionDetails.join('; ')} }`,
    };
  }

  /** Tags component (weight: 12 if not set otherwise). All vacancy tags are required; extra custom tags earn bonus. */
  private scoreTags(
    vacancyTags?: string[],
    submissionTags?: string[],
    weight?: number,
  ): ScoreResult | null {
    if (!vacancyTags?.length) return null;

    const vacancyTagSet = new Set(vacancyTags);
    const matchedCount =
      submissionTags?.filter((t) => vacancyTagSet.has(t)).length ?? 0;
    const ratio = matchedCount / vacancyTags.length;

    const extraCount = (submissionTags || []).filter(
      (t) => !vacancyTagSet.has(t),
    ).length;

    return {
      dimension: 'Tags',
      ratio,
      weight: weight ?? 12,
      bonus: extraCount,
      log: `Tags: ${matchedCount}/${vacancyTags.length} required (bonus: +${extraCount} extra, weight: ${weight}) { vacancy: [${vacancyTags.join(', ')}], candidate: [${(submissionTags || []).join(', ')}] }`,
    };
  }

  /** Languages component (weight: 8 if not set otherwise). +1 per level above required, +1 per extra language (max +3). */
  private scoreLanguages(
    requirements?: LanguageProficiency[],
    candidateLangs?: LanguageProficiency[],
    weight?: number,
  ): ScoreResult | null {
    if (!requirements?.length) return null;

    let metCount = 0;
    let levelBonus = 0;

    for (const req of requirements) {
      const match = candidateLangs?.find((cl) => {
        if (req.code && cl.code !== req.code) return false;
        if (req.level) {
          if (!cl.level) return false;
          if (
            LanguageLevelRank.indexOf(cl.level) <
            LanguageLevelRank.indexOf(req.level)
          )
            return false;
        }
        return true;
      });

      if (match) {
        metCount++;
        if (req.level && match.level) {
          const diff =
            LanguageLevelRank.indexOf(match.level) -
            LanguageLevelRank.indexOf(req.level);
          if (diff > 0) levelBonus += diff;
        }
      }
    }

    const ratio = metCount / requirements.length;

    const requiredCodes = new Set(
      requirements.map((r) => r.code).filter(Boolean),
    );
    const extraLangBonus = Math.min(
      (candidateLangs || []).filter(
        (cl) => cl.code && !requiredCodes.has(cl.code),
      ).length,
      3,
    );

    return {
      dimension: 'Languages',
      ratio,
      weight: weight ?? 8,
      bonus: levelBonus + extraLangBonus,
      log: `Languages: ${metCount}/${requirements.length} required (levelBonus: +${levelBonus}, extraLangs: +${extraLangBonus}, weight: ${weight}) { required: [${requirements.map((r) => `${r.code}:${r.level}`).join(', ')}], candidate: [${(candidateLangs || []).map((l) => `${l.code}:${l.level}`).join(', ')}] }`,
    };
  }

  /** Experience component (weight: 20 if not set otherwise). +1 per extra year above required (max +5). */
  private scoreExperience(
    requiredYears?: number,
    candidateYears?: number,
    weight?: number,
  ): ScoreResult | null {
    if (requiredYears == null || requiredYears <= 0 || candidateYears == null)
      return null;

    const ratio = Math.min(candidateYears, requiredYears) / requiredYears;
    const bonus = Math.min(Math.max(0, candidateYears - requiredYears), 5);

    return {
      dimension: 'Experience',
      ratio,
      weight: weight ?? 20,
      bonus,
      log: `Experience: ${candidateYears}/${requiredYears} yrs (bonus: +${bonus} with provided weight - ${weight})`,
    };
  }

  /** Salary component. Within budget = met. Bonus up to +3 for being below max.
   * More detailed logic:
   * - 100 (ratio = 1): candidate's expectedSalary <= maxSalary — they're within budget
   * - 0 (ratio = 0): candidate's expectedSalary > maxSalary — over budget, no partial credit
   * - Bonus (pushes above 100): if candidate asks for less than maxSalary, up to +3 points proportional to how far below
   *  max they are: (max - expected) / (max - min) * 3. If min === max and candidate is below, flat +2.
   * So it's binary pass/fail against the budget ceiling, with a bonus rewarding cheaper candidates. There's no partial
   *  score for being slightly over budget — it's either 0 or full.
   */
  private scoreSalary(
    minSalary?: number | null,
    maxSalary?: number | null,
    expectedSalary?: number | null,
    weight?: number,
  ): ScoreResult | null {
    if (maxSalary == null || expectedSalary == null) return null;

    const min = minSalary ?? maxSalary;
    const ratio = expectedSalary <= maxSalary ? 1 : 0;

    let bonus = 0;
    if (expectedSalary < maxSalary) {
      if (maxSalary === min) {
        bonus = 2;
      } else {
        bonus = Math.min(
          3,
          ((maxSalary - expectedSalary) / (maxSalary - min)) * 3,
        );
      }
    }

    return {
      dimension: 'Salary',
      ratio,
      weight: weight ?? 10,
      bonus,
      log: `Salary: ${ratio ? 'within' : 'over'} budget (expected: ${expectedSalary}, range: ${min}-${maxSalary}, bonus: +${bonus.toFixed(2)} with provided weight - ${weight})`,
    };
  }

  async parseResumeFile(
    submissionId: string,
    file: Express.Multer.File,
    extension: string,
  ): Promise<VacancySubmissionDto> {
    const submission = await this.findOneById(submissionId);

    const extractedText =
      await this.saplingService.extractTextFromResumeDependingOnExtension(
        file,
        extension,
      );

    if (!extractedText) {
      throw new HttpException(
        'Failed to extract text from resume file due to an internal error. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (
      typeof extractedText === 'string' &&
      extractedText.trim().length === 0
    ) {
      throw new BadRequestException(
        'No readable text was found in the uploaded resume. Please upload a file with selectable text (for example, a non-scanned PDF or DOCX).',
      );
    }

    submission.resume = extractedText;
    const aiResult = await this.saplingService.detectAiContent(extractedText);

    submission.resumeAiScore = aiResult?.score ?? null;
    submission.resumeAiSentenceScores = aiResult?.sentenceScores ?? null;

    const saved = await this.vacancySubmissionRepository.save(submission);
    return vacancySubmToVacancySubmDto(saved);
  }

  async recalculateMatchScore(
    submissionId: string,
  ): Promise<VacancySubmissionDto> {
    const submission = await this.vacancySubmissionRepository.findOne({
      where: { id: submissionId },
      relations: ['answers', 'candidateProfile', 'candidateProfile.user'],
    });

    if (!submission) {
      throw new HttpException(
        'Vacancy Submission not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const vacancy = await this.vacancyService.findVacancyById(
      submission.vacancyId,
    );

    const vacancyQuestions =
      await this.vacancyService.findAllQuestionsByVacancyId(
        submission.vacancyId,
      );

    submission.matchScore = this.calculateMatchScore(
      submission.answers || [],
      vacancyQuestions,
      {
        candidateLanguages: submission.candidateProfile?.languages,
        candidateYearsOfExperience:
          submission.candidateProfile?.yearsOfExperience,
        vacancyLanguageRequirements: vacancy.languageRequirements,
        vacancyRequiredYearsOfExperience: vacancy.requiredYearsOfExperience,
        vacancyTags: vacancy.tags,
        vacancyMinSalary: vacancy.minSalary,
        vacancyMaxSalary: vacancy.maxSalary,
        submissionTags: submission.tags,
        expectedSalary: submission.expectedSalary,
        customWeights: vacancy.customWeights,
      },
    );

    const saved = await this.vacancySubmissionRepository.save(submission);
    return vacancySubmToVacancySubmDto(saved);
  }

  async findOneById(id: string): Promise<VacancySubmission> {
    const submission = await this.vacancySubmissionRepository.findOne({
      where: { id },
    });

    if (!submission) {
      throw new HttpException(
        'Vacancy Submission not found.',
        HttpStatus.NOT_FOUND,
      );
    }
    return submission;
  }
}
