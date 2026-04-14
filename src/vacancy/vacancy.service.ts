import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Vacancy } from '../entities/vacancy';
import { VacancyQuestion } from '../entities/vacancyQuestion';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { QuestionType } from '../entities/question.enum';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { GeneralVacancyDto } from '../vacancy/dto/generalVacancy.dto';
import { CreateVacancyDto } from '../vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { UserDto } from '../user/dto/user.dto';
import { UserRole } from '../entities/role.enum';
import { vacancyToVacancyDto } from '../vacancy/map/vacancy.map';
import { vacancyToGeneralVacancyDto } from '../vacancy/map/generalVacancy.map';
import { VacancyQuestionDto } from '../vacancy/dto/vacancyQuestion.dto';
import { vacancyQuestionToDto } from '../vacancy/map/vacancyQuestion.map';
import { UserService } from '../user/user.service';
import { QuestionService } from '../question/question.service';
import { CreateVacancyQuestionDto } from './dto/createVacancyQuesion.dto';
import { VacancyQuestionDetailedDto } from './dto/vacancyQuestionDetailed.dto';
import { vacancyQuestionToDetailedDto } from './map/vacancyQuestionDetailed.map';
import { CreateVacancyQuestionInlineDto } from './dto/createVacancyWithQuestions.dto';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';
import { VacancyFilterDto } from '../vacancy/dto/vacancyFilter.dto';
import { parseSalaryRange } from '../utils/parseSalaryRange';
import { LanguageLevelRank } from '../entities/hiring.enum';

@Injectable()
export class VacancyService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    @InjectRepository(VacancyQuestion)
    private readonly vacancyQuestionRepository: Repository<VacancyQuestion>,

    private readonly userService: UserService,
    private readonly questionService: QuestionService,

    @Inject(forwardRef(() => VacancySubmissionService))
    private readonly vacancySubmissionService: VacancySubmissionService,
  ) {}

  async findAll(tenantId?: string): Promise<VacancyDto[]> {
    const vacancies = await this.fetchAllVacancies(tenantId);
    return vacancies.map(vacancyToVacancyDto);
  }

  async findAllForBrowse(): Promise<GeneralVacancyDto[]> {
    const vacancies = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .leftJoinAndSelect('vacancy.vacancyQuestions', 'vq')
      .loadRelationCountAndMap('vacancy.submissionCount', 'vacancy.submissions')
      .getMany();

    return vacancies.map(vacancyToGeneralVacancyDto);
  }

  async findAllWithFilters(
    filterDto?: CandidateVacancyFilterDto,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
  ): Promise<VacancyDto[]> {
    const vacancies = await this.fetchVacanciesWithFilters(
      filterDto,
      sortBy,
      order,
    );
    return vacancies.map(vacancyToVacancyDto);
  }

  async findAllWithFiltersForCandidates(
    filterDto?: CandidateVacancyFilterDto,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
  ): Promise<CandidateVacancyDto[]> {
    const vacancies = await this.fetchVacanciesWithFilters(
      filterDto,
      sortBy,
      order,
      true,
    );
    return vacancies.map(vacancyToCandidateVacancyDto);
  }

  async findVacancyByIdForCandidates(
    vacancyId: string,
  ): Promise<CandidateVacancyDto> {
    const vacancy = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .leftJoinAndSelect('vacancy.vacancyQuestions', 'vq')
      .loadRelationCountAndMap('vacancy.submissionCount', 'vacancy.submissions')
      .where('vacancy.id = :vacancyId', { vacancyId })
      .getOne();

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancyToCandidateVacancyDto(vacancy);
  }

  private async fetchAllVacancies(tenantId?: string): Promise<Vacancy[]> {
    return this.vacancyRepository.find({
      where: tenantId ? { tenantId } : {},
      relations: ['vacancyQuestions'],
    });
  }

  private async fetchVacanciesWithFilters(
    filterDto?: CandidateVacancyFilterDto,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
    loadSubmissionCount = false,
  ): Promise<Vacancy[]> {
    const query = this.vacancyRepository
      .createQueryBuilder('vacancy')
      .leftJoinAndSelect('vacancy.vacancyQuestions', 'vq');

    if (loadSubmissionCount) {
      query.loadRelationCountAndMap(
        'vacancy.submissionCount',
        'vacancy.submissions',
      );
    }

    if (filterDto?.name) {
      query.andWhere('vacancy.name ILIKE :name', {
        name: `%${filterDto.name}%`,
      });
    }

    if (filterDto?.timeCommitment?.length) {
      query.andWhere('vacancy.time_commitment IN (:...timeCommitments)', {
        timeCommitments: filterDto.timeCommitment,
      });
    }

    if (filterDto?.minRequiredExperience != null) {
      query.andWhere(
        '(vacancy.required_years_of_experience >= :minExp OR vacancy.required_years_of_experience IS NULL)',
        { minExp: filterDto.minRequiredExperience },
      );
    }

    if (filterDto?.maxRequiredExperience != null) {
      query.andWhere(
        '(vacancy.required_years_of_experience <= :maxExp OR vacancy.required_years_of_experience IS NULL)',
        { maxExp: filterDto.maxRequiredExperience },
      );
    }

    // SQL-side sorting (for non-salary fields)
    if (sortBy !== 'salary') {
      this.applyVacancySorting(query, sortBy, order);
    }

    let vacancies = await query.getMany();

    // In-memory filters
    if (filterDto?.minSalary != null || filterDto?.maxSalary != null) {
      vacancies = vacancies.filter((v) => {
        const range = parseSalaryRange(v.salary);

        if (!range) return false;

        if (filterDto.minSalary != null && range.max < filterDto.minSalary)
          return false;

        if (filterDto.maxSalary != null && range.min > filterDto.maxSalary)
          return false;

        return true;
      });
    }

    if (filterDto?.tags?.length) {
      const filterTags = new Set(filterDto.tags.map((t) => t.toLowerCase()));

      vacancies = vacancies.filter((v) =>
        v.tags?.some((t) => filterTags.has(t.toLowerCase())),
      );
    }

    if (filterDto?.languageRequirements?.length) {
      vacancies = vacancies.filter((v) => {
        if (!v.languageRequirements?.length) return false;

        return filterDto.languageRequirements!.some((filterLang) =>
          v.languageRequirements!.some((vacLang) => {
            if (filterLang.code && vacLang.code !== filterLang.code)
              return false;

            if (filterLang.level && vacLang.level) {
              return (
                LanguageLevelRank.indexOf(vacLang.level) >=
                LanguageLevelRank.indexOf(filterLang.level)
              );
            }
            return true;
          }),
        );
      });
    }

    // In-memory sorting for salary (free-text field, can't sort in SQL)
    if (sortBy === 'salary') {
      vacancies = this.applySalarySorting(vacancies, order);
    }

    return vacancies;
  }

  async findVacanciesWithSubmissions(
    requesterId: string,
  ): Promise<VacancyDto[]> {
    const requester = await this.userService.findById(requesterId);

    const vacancyQuery = this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoinAndSelect('vacancy.submissions', 'submission')
      .leftJoinAndSelect('vacancy.vacancyQuestions', 'vq');

    if (requester.role !== UserRole.superAdmin) {
      if (
        requester.role === UserRole.admin ||
        requester.role === UserRole.recruiter
      ) {
        vacancyQuery.andWhere('vacancy.tenantId = :tenantId', {
          tenantId: requester.tenantId,
        });
      } else if (requester.role === UserRole.candidate) {
        throw new HttpException(
          'Candidates are not allowed to see if vacancies have submissions.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const vacancies = await vacancyQuery.getMany();
    return vacancies.map(vacancyToVacancyDto);
  }

  async findVacancyById(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.fetchVacancyById(vacancyId);
    return vacancyToVacancyDto(vacancy);
  }

  private async fetchVacancyById(vacancyId: string): Promise<Vacancy> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
      relations: ['vacancyQuestions'],
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancy;
  }

  async findAllByTenantId(tenantId: string): Promise<VacancyDto[]> {
    const vacanciesWithGivenTenant = await this.vacancyRepository.find({
      where: { tenantId },
      relations: ['vacancyQuestions'],
    });

    if (!vacanciesWithGivenTenant?.length) {
      throw new HttpException(
        'No vacancies within provided tenant were found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return vacanciesWithGivenTenant.map(vacancyToVacancyDto);
  }

  async create(
    createVacancyDto: CreateVacancyDto,
    creator: UserDto,
  ): Promise<VacancyDto> {
    const { vacancyQuestions, ...vacancyFields } = createVacancyDto;

    const savedVacancy = await this.saveBaseVacancy(vacancyFields, creator);

    if (vacancyQuestions?.length) {
      await this.handleVacancyQuestions(
        savedVacancy.id,
        savedVacancy.tenantId,
        vacancyQuestions,
      );
    }

    return this.getPopulatedVacancy(savedVacancy.id);
  }

  async update(
    vacancyId: string,
    updateVacancyDto: UpdateVacancyDto,
  ): Promise<VacancyDto> {
    const vacancy: Vacancy =
      await this.findVacancyByIdWithSubmissionsAndAnswers(vacancyId);

    Object.keys(updateVacancyDto).forEach((key) => {
      if (updateVacancyDto[key] !== undefined && key !== 'vacancyQuestions') {
        vacancy[key] = updateVacancyDto[key];
      }
    });

    this.applyVacancyQuestionUpdates(updateVacancyDto, vacancy);

    const fieldsThatAffectMatchScore = [
      updateVacancyDto.vacancyQuestions,
      updateVacancyDto.tags,
      updateVacancyDto.languageRequirements,
      updateVacancyDto.requiredYearsOfExperience,
      updateVacancyDto.salary,
      updateVacancyDto.customWeights,
    ];

    const shouldRecalculateMatchScores = fieldsThatAffectMatchScore.some(
      (field) => field !== undefined,
    );

    // Recluster submissions and recalculate match scores if any of the fields that affect match score were updated
    if (shouldRecalculateMatchScores) {
      vacancy.needsReclustering = true;
    }

    await this.vacancyRepository.save(vacancy);

    if (shouldRecalculateMatchScores) {
      await this.recalculateSubmissionMatchScores(vacancyId);
    }

    return this.getPopulatedVacancy(vacancyId);
  }

  async remove(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.findVacancyById(vacancyId);

    await this.vacancyRepository.delete(vacancyId);
    return vacancy;
  }

  async getTenantIdByVacancyId(vacancyId: string): Promise<string> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
      select: ['tenantId'],
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancy.tenantId;
  }

  //  METHODS RELATED TO MANAGING VACANCY QUESTIONS
  async addQuestionToVacancy(
    vacancyId: string,
    questionId: string,
    body: CreateVacancyQuestionDto,
  ): Promise<VacancyQuestionDto> {
    const vacancy = await this.findVacancyById(vacancyId);
    const question = await this.questionService.findDtoById(questionId);

    // Allow adding question to vacancy only if they belong to the same tenant
    if (vacancy.tenantId !== question.tenantId) {
      throw new HttpException(
        `Vacancy and Question belong to different tenants. Vacancy belongs to tenant with ID: ${vacancy.tenantId}, while Question belongs to tenant with ID: ${question.tenantId}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.vacancyQuestionRepository.findOne({
      where: { vacancyId, questionId },
    });

    if (existing) {
      throw new HttpException(
        'Question is already linked to this vacancy.',
        HttpStatus.CONFLICT,
      );
    }

    if (body.expectedValue) {
      this.validateExpectedValue(
        body.expectedValue,
        question.type,
        question.answerOptions,
        question.label,
      );
    }

    const vacancyQuestion = this.vacancyQuestionRepository.create({
      vacancyId,
      questionId,
      isRequired: body.isRequired,
      priority: body.priority ?? 1,
      expectedValue: body.expectedValue,
    });

    const saved = await this.vacancyQuestionRepository.save(vacancyQuestion);
    return vacancyQuestionToDto(saved);
  }

  async removeQuestionFromVacancy(
    vacancyId: string,
    questionId: string,
  ): Promise<VacancyQuestionDto> {
    await this.findVacancyById(vacancyId);
    await this.questionService.findDtoById(questionId);

    const existing = await this.vacancyQuestionRepository.findOne({
      where: { vacancyId, questionId },
    });

    if (!existing) {
      throw new HttpException(
        'Question is not linked to this vacancy.',
        HttpStatus.NOT_FOUND,
      );
    }

    const dto = vacancyQuestionToDto(existing);
    await this.vacancyQuestionRepository.remove(existing);

    return dto;
  }

  async findAllQuestionsByVacancyId(
    vacancyId: string,
  ): Promise<VacancyQuestionDetailedDto[]> {
    const vacancyQuestions: VacancyQuestion[] =
      await this.vacancyQuestionRepository
        .createQueryBuilder('vq')
        .innerJoinAndSelect('vq.question', 'question')
        .where('vq.vacancyId = :vacancyId', { vacancyId })
        .getMany();

    return vacancyQuestions.map(vacancyQuestionToDetailedDto);
  }

  async findAllVacanciesThatHaveQuestions(
    tenantId?: string,
  ): Promise<VacancyDto[]> {
    const vacancies = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoinAndSelect('vacancy.vacancyQuestions', 'vq')
      .where(tenantId ? 'vacancy.tenantId = :tenantId' : '1=1')
      .setParameter('tenantId', tenantId)
      .getMany();

    return vacancies.map(vacancyToVacancyDto);
  }

  async findVacancyByIdWithSubmissionsAndAnswers(
    vacancyId: string,
  ): Promise<Vacancy> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
      relations: ['vacancyQuestions', 'submissions', 'submissions.answers'],
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancy;
  }

  private async saveBaseVacancy(
    fields: Partial<CreateVacancyDto>,
    creator: UserDto,
  ): Promise<Vacancy> {
    const vacancy = this.vacancyRepository.create({
      ...fields,
      tenantId: creator.tenantId,
      createdById: creator.id,
      createdBy: creator,
    });

    return this.vacancyRepository.save(vacancy);
  }

  /**
   * Creates questions via QuestionService and links them to the Vacancy if this question doesn't exist yet.
   *  If the question already exists, just links it to the Vacancy.
   */
  private async handleVacancyQuestions(
    vacancyId: string,
    tenantId: string,
    questions: CreateVacancyQuestionInlineDto[],
  ): Promise<void> {
    const linkPromises = questions.map(async (q) => {
      let question = await this.questionService.findExistingQuestion(
        q,
        tenantId,
      );

      if (!question) {
        question = await this.questionService.create(
          { label: q.label, type: q.type, answerOptions: q.answerOptions },
          tenantId,
        );
      }

      if (q.expectedValue) {
        this.validateExpectedValue(
          q.expectedValue,
          q.type,
          q.answerOptions ?? question.answerOptions,
          q.label,
        );
      }

      return this.vacancyQuestionRepository.create({
        vacancyId,
        questionId: question.id,
        isRequired: q.isRequired,
        priority: q.priority ?? 1,
        expectedValue: q.expectedValue,
      });
    });

    const vacancyQuestions = await Promise.all(linkPromises);

    await this.vacancyQuestionRepository.save(vacancyQuestions);
  }

  /**
   * Validates the expectedValue.
   * For boolean questions, expectedValue must be 'true' or 'false'.
   * For dropdown questions, expectedValue must be from answerOptions
   */
  private validateExpectedValue(
    expectedValue: string | string[],
    questionType: QuestionType,
    answerOptions: string[] | undefined,
    questionLabel: string,
  ): void {
    if (questionType === QuestionType.boolean) {
      if (Array.isArray(expectedValue)) {
        throw new BadRequestException(
          `Expected value for boolean question '${questionLabel}' must be a string ('true' or 'false'), not an array.`,
        );
      }
      if (expectedValue !== 'true' && expectedValue !== 'false') {
        throw new BadRequestException(
          `Expected value for boolean question '${questionLabel}' must be 'true' or 'false', but received: '${expectedValue}'.`,
        );
      }
    }

    if (questionType === QuestionType.dropdown) {
      if (!Array.isArray(expectedValue)) {
        throw new BadRequestException(
          `Expected value for dropdown question '${questionLabel}' must be an array of strings.`,
        );
      }

      if (!answerOptions?.length) {
        throw new BadRequestException(
          `Question '${questionLabel}' does not have defined answer options, so expected value cannot be provided.`,
        );
      }

      for (const val of expectedValue) {
        if (!answerOptions.includes(val)) {
          throw new BadRequestException(
            `Expected value for dropdown question '${questionLabel}' must be one of: ${answerOptions.join(', ')}. Received: '${val}'.`,
          );
        }
      }
    }
  }

  private async getPopulatedVacancy(id: string): Promise<VacancyDto> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id },
      relations: ['vacancyQuestions', 'vacancyQuestions.question'],
    });

    if (!vacancy) {
      throw new HttpException(
        'Vacancy not found after creation/update.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return vacancyToVacancyDto(vacancy);
  }

  private applyVacancyQuestionUpdates(
    updateVacancyDto: UpdateVacancyDto,
    vacancy: VacancyDto,
  ): void {
    if (!updateVacancyDto.vacancyQuestions || !vacancy.vacancyQuestions) return;

    updateVacancyDto.vacancyQuestions.forEach((updatedQuestion) => {
      const existingQuestion = vacancy.vacancyQuestions!.find(
        (vq) => vq.questionId === updatedQuestion.questionId,
      );

      if (existingQuestion) {
        existingQuestion.isRequired = updatedQuestion.isRequired;
        existingQuestion.priority =
          updatedQuestion.priority ?? existingQuestion.priority;
        existingQuestion.expectedValue =
          updatedQuestion.expectedValue ?? existingQuestion.expectedValue;
      }
    });
  }

  /**
   * Recalculates matchScore for all submissions linked to this vacancy.
   */
  private async recalculateSubmissionMatchScores(
    vacancyId: string,
  ): Promise<void> {
    const allVacancyQuestions =
      await this.findAllQuestionsByVacancyId(vacancyId);

    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
      relations: [
        'submissions',
        'submissions.answers',
        'submissions.candidateProfile',
      ],
    });

    if (!vacancy?.submissions?.length) return;

    for (const submission of vacancy.submissions) {
      submission.matchScore = this.vacancySubmissionService.calculateMatchScore(
        submission.answers || [],
        allVacancyQuestions,
        {
          candidateLanguages: submission.candidateProfile?.languages,
          candidateYearsOfExperience:
            submission.candidateProfile?.yearsOfExperience,
          vacancyLanguageRequirements: vacancy.languageRequirements,
          vacancyRequiredYearsOfExperience: vacancy.requiredYearsOfExperience,
          vacancyTags: vacancy.tags,
          vacancySalary: vacancy.salary,
          submissionTags: submission.tags,
          expectedSalary:
            submission.expectedSalary != null
              ? Number(submission.expectedSalary)
              : null,
          customWeights: vacancy.customWeights,
        },
      );
    }

    await this.vacancyRepository.manager.save(vacancy.submissions);
  }

  private static readonly SQL_SORT_FIELDS = [
    'createdAt',
    'requiredYearsOfExperience',
  ];

  private applyVacancySorting(
    query: SelectQueryBuilder<Vacancy>,
    sortBy?: string,
    order?: 'ASC' | 'DESC',
  ): void {
    if (sortBy && VacancyService.SQL_SORT_FIELDS.includes(sortBy)) {
      const direction = order === 'ASC' || order === 'DESC' ? order : 'DESC';
      query.orderBy(`vacancy.${sortBy}`, direction, 'NULLS LAST');
    }
  }

  private applySalarySorting(
    vacancies: Vacancy[],
    order?: 'ASC' | 'DESC',
  ): Vacancy[] {
    const direction = order === 'ASC' || order === 'DESC' ? order : 'DESC';

    // Precompute sortable salary midpoint
    const decorated = vacancies.map((vacancy) => {
      const range = parseSalaryRange(vacancy.salary);
      const sortKey = range ? (range.min + range.max) / 2 : null;
      return { vacancy, sortKey };
    });

    // Sort using the precomputed key; non-parseable salaries will go to the end
    decorated.sort((a, b) => {
      if (a.sortKey === null && b.sortKey === null) return 0;
      if (a.sortKey === null) return 1;
      if (b.sortKey === null) return -1;
      return direction === 'ASC'
        ? a.sortKey - b.sortKey
        : b.sortKey - a.sortKey;
    });

    return decorated.map((item) => item.vacancy);
  }
}
