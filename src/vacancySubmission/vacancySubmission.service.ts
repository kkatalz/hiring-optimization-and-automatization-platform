import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancyService } from '../vacancy/vacancy.service';
import { CreateVacancySubmissionDto } from './dto/createVacancySubmission.dto';
import { VacancySubmissionDto } from './dto/vacancySubmission.dto';
import { vacancySubmToVacancySubmDto } from './map/vacancySubmission.map';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { VacancySubmissionStatus } from '../entities/statuses.enum';
import { CandidateProfileService } from '../candidateProfile/candidateProfile.service';
import {
  QuestionAnswerFilterEntry,
  RecruitingFilterDto,
} from '../recruiting/recruitingFilter.dto';
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

@Injectable()
export class VacancySubmissionService {
  constructor(
    @InjectRepository(VacancySubmission)
    private readonly vacancySubmissionRepository: Repository<VacancySubmission>,

    @InjectRepository(SubmissionAnswer)
    private readonly submissionAnswerRepository: Repository<SubmissionAnswer>,

    private readonly vacancyService: VacancyService,

    private readonly profileService: CandidateProfileService,

    private readonly questionService: QuestionService,

    private dataSource: DataSource,
  ) {}

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

    // Validate that Submission has only allowed tags in Vacancy
    this.validateSubmissionHasOnlyAllowedTags(
      createVacancySubmissionDto,
      vacancy,
    );

    // Check that candidate responded to each required question in Vacancy
    await this.validateRequiredQuestionsAnswered(
      createVacancySubmissionDto,
      vacancy,
    );

    // Calculate match score based on answers vs expected values
    const allVacancyQuestions =
      await this.vacancyService.findAllQuestionsByVacancyId(vacancy.id);

    const matchScore = this.calculateMatchScore(
      createVacancySubmissionDto.answers || [],
      allVacancyQuestions,
    );

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const vacancySubmission = this.vacancySubmissionRepository.create({
          ...createVacancySubmissionDto,
          vacancyId: vacancyId,
          tenantId: vacancy.tenantId,
          candidateId: candidate.id,
          matchScore: matchScore,
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

        return vacancySubmToVacancySubmDto(savedVacancySubmission);
      },
    );
  }

  async getTenantIdBySubmissionId(submissionId: string): Promise<string> {
    const submission = await this.vacancySubmissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new HttpException(
        'Vacancy Submission not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return submission.tenantId;
  }

  async findAllSubmissionsWithinVacancyWithFilters(
    vacancyId: string,
    filterSubmissionsDto?: RecruitingFilterDto,
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
    filterSubmissionsDto?: RecruitingFilterDto,
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
    const submission = await this.vacancySubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });

    if (!submission) {
      throw new HttpException(
        'Vacancy Submission not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (submission.status !== VacancySubmissionStatus.approved)
      submission.status = VacancySubmissionStatus.approved;

    const savedSubmission =
      await this.vacancySubmissionRepository.save(submission);

    return vacancySubmToVacancySubmDto(savedSubmission);
  }

  async reject(submissionId: string): Promise<VacancySubmissionDto> {
    const submission = await this.vacancySubmissionRepository.findOne({
      where: {
        id: submissionId,
      },
    });

    if (!submission) {
      throw new HttpException(
        'Vacancy Submission not found.',
        HttpStatus.NOT_FOUND,
      );
    }

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

  private static readonly ALLOWED_SORT_FIELDS = ['matchScore'];

  private async executeFilteredSubmissions(
    query: SelectQueryBuilder<VacancySubmission>,
    filterDto?: RecruitingFilterDto,
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
          filterDto.languages!.some((req) =>
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
      const isInvalidBool = answer.value !== 'true' && answer.value !== 'false';

      if (isInvalidBool) {
        throw new BadRequestException(
          `Question '${questionMatch.label}' - (ID: ${answer.questionId}) requires a boolean value ('true' or 'false'), but received: '${answer.value}'`,
        );
      }
    }

    if (
      questionMatch.type === QuestionType.dropdown &&
      questionMatch.answerOptions?.length &&
      answer.value
    ) {
      if (!questionMatch.answerOptions.includes(answer.value)) {
        throw new BadRequestException(
          `Value for question ${answer.questionId} must be one of: ${questionMatch.answerOptions.join(', ')}`,
        );
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

  private validateSubmissionHasOnlyAllowedTags(
    createVacancySubmissionDto: CreateVacancySubmissionDto,
    vacancy: VacancyDto,
  ): void {
    if (createVacancySubmissionDto.tags) {
      const allowedTags = new Set(vacancy.tags);

      const invalidTags = createVacancySubmissionDto.tags.filter(
        (tag) => !allowedTags.has(tag),
      );

      if (invalidTags.length) {
        throw new BadRequestException(
          `Invalid tags: ${invalidTags.join(', ')}. Allowed tags are: ${vacancy.tags?.join(', ')}.`,
        );
      }
    }
  }

  /**
   * Calculates match score using weighted priority formula.
   * Score = sum((1/pi)*xi) / sum(1/pi) * 100
   * Text questions are excluded from scoring.
   * Questions without expectedValue are excluded from scoring.
   * Returns null if no scorable questions exist.
   */
  private calculateMatchScore(
    answers: QuestionAnswerAllRequiredDto[],
    vacancyQuestions: VacancyQuestionDetailedDto[],
  ): number | null {
    // Only score non-text questions that have an expectedValue
    const scorableQuestions = vacancyQuestions.filter(
      (vq) => vq.type !== QuestionType.text && vq.expectedValue != null,
    );

    if (scorableQuestions.length === 0) return null;

    const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));

    let weightedSum = 0;
    let weightTotal = 0;

    for (const vq of scorableQuestions) {
      const weight = 1 / vq.priority;
      const candidateAnswer = answerMap.get(vq.questionId);
      const isMatch = candidateAnswer === vq.expectedValue ? 1 : 0;

      weightedSum += weight * isMatch;
      weightTotal += weight;
    }

    const score = (weightedSum / weightTotal) * 100;
    return Math.round(score * 100) / 100; // round to 2 decimal places
  }
}
