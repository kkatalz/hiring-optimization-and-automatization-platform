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
import { Repository } from 'typeorm';
import { VacancySubmissionStatus } from '../entities/statuses.enum';
import { CandidateProfileService } from '../candidateProfile/candidateProfile.service';
import { RecruitingFilterDto } from '../recruiting/recruitingFilter.dto';
import {
  filterByAnswers,
  filterByExperience,
  filterByCountriesCities,
  meetsLanguageRequirement,
} from '../utils/filterSubmissionsAndCandidateProfiles';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { CandidateProfile } from '../entities/candidateProfile';
import { QuestionService } from '../question/question.service';
import { QuestionDto } from '../question/dto/question.dto';
import { QuestionType } from '../entities/question.enum';
import { SubmissionAnswer } from '../entities/submissionAnswers';

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

    const vacancySubmission = this.vacancySubmissionRepository.create({
      ...createVacancySubmissionDto,
      vacancyId: vacancyId,
      tenantId: vacancy.tenantId,
      candidateId: candidate.id,
      vacancy: vacancy,
      candidateProfile: candidate,
    });

    const savedVacancySubmission =
      await this.vacancySubmissionRepository.save(vacancySubmission);

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

      await this.submissionAnswerRepository.save(submissionAnswers);
    }

    return vacancySubmToVacancySubmDto(savedVacancySubmission);
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
  ): Promise<VacancySubmissionDto[]> {
    if (!filterSubmissionsDto) {
      const submissions = await this.vacancySubmissionRepository.find({
        where: { vacancyId },
        relations: ['candidateProfile', 'candidateProfile.user'],
      });
      return submissions.map(vacancySubmToVacancySubmDto);
    }

    const query = this.vacancySubmissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.vacancy', 'vacancy')
      .leftJoinAndSelect('submission.candidateProfile', 'candidateProfile')
      .leftJoinAndSelect('candidateProfile.user', 'user')
      .leftJoinAndSelect('submission.answers', 'answers')
      .where('submission.vacancy_id = :vacancyId', { vacancyId });

    filterByExperience(query, filterSubmissionsDto);
    filterByCountriesCities(query, filterSubmissionsDto);

    let submissions = await query.getMany();

    if (filterSubmissionsDto.answers?.length) {
      submissions = filterByAnswers(submissions, filterSubmissionsDto.answers);
    }

    if (filterSubmissionsDto.languages?.length) {
      submissions = submissions.filter((s) => {
        if (!s.candidateProfile) return false;
        const { languages } = s.candidateProfile;
        return filterSubmissionsDto.languages!.some((requiredLang) =>
          meetsLanguageRequirement(languages, requiredLang),
        );
      });
    }

    return submissions.map(vacancySubmToVacancySubmDto);
  }

  async findAllSubmissionsWithinTenantWithFilters(
    tenantId: string,
    filterSubmissionsDto?: RecruitingFilterDto,
  ): Promise<VacancySubmissionDto[]> {
    if (!filterSubmissionsDto) {
      const submissions = await this.vacancySubmissionRepository.find({
        where: { tenantId },
        relations: ['candidateProfile', 'candidateProfile.user'],
      });
      return submissions.map(vacancySubmToVacancySubmDto);
    }

    // If filters are provided, validate that the questionIds in answers[] exist
    if (filterSubmissionsDto.answers?.length) {
      await Promise.all(
        filterSubmissionsDto.answers.map((pair) =>
          this.questionService.findDtoById(pair.questionId),
        ),
      );
    }

    const query = this.vacancySubmissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.vacancy', 'vacancy')
      .leftJoinAndSelect('submission.candidateProfile', 'candidateProfile')
      .leftJoinAndSelect('candidateProfile.user', 'user')
      .leftJoinAndSelect('submission.answers', 'answers')
      .where('submission.tenant_id = :tenantId', { tenantId });

    filterByExperience(query, filterSubmissionsDto);
    filterByCountriesCities(query, filterSubmissionsDto);

    let submissions = await query.getMany();

    if (filterSubmissionsDto.answers?.length) {
      submissions = filterByAnswers(submissions, filterSubmissionsDto.answers);
    }

    if (filterSubmissionsDto.languages?.length) {
      submissions = submissions.filter((s) => {
        if (!s.candidateProfile) return false;
        const { languages } = s.candidateProfile;
        return filterSubmissionsDto.languages!.some((requiredLang) =>
          meetsLanguageRequirement(languages, requiredLang),
        );
      });
    }

    return submissions.map(vacancySubmToVacancySubmDto);
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

  private async validateRequiredQuestionsAnswered(
    createVacancySubmissionDto: CreateVacancySubmissionDto,
    vacancy: VacancyDto,
  ) {
    const allVacancyQuestions =
      await this.vacancyService.findAllQuestionsByVacancyId(vacancy.id);

    if (
      !createVacancySubmissionDto.answers ||
      allVacancyQuestions.length === 0
    ) {
      createVacancySubmissionDto.answers = [];
      return;
    }

    const allVacancyQuestionIds = allVacancyQuestions.map((q) => q.questionId);

    for (const answer of createVacancySubmissionDto.answers) {
      if (!allVacancyQuestionIds.includes(answer.questionId)) {
        throw new BadRequestException(
          `Current vacancy does not have question with id: ${answer.questionId}, but: ${allVacancyQuestionIds.join(', ')}`,
        );
      }
    }

    for (const answer of createVacancySubmissionDto.answers) {
      const questionDetails = await this.questionService.getQuestionDetailsById(
        answer.questionId,
      );

      if (
        questionDetails.type === QuestionType.dropdown &&
        questionDetails.answerOptions?.length &&
        answer.value
      ) {
        if (!questionDetails.answerOptions.includes(answer.value)) {
          throw new BadRequestException(
            `Value in answers for question with id - ${answer.questionId} must be either of: ${questionDetails.answerOptions.join(', ')}`,
          );
        }
      }
    }

    const requiredQuestions = vacancy.vacancyQuestions?.filter(
      (q) => q.isRequired,
    );

    if (requiredQuestions) {
      const answeredQuestionIds = createVacancySubmissionDto.answers?.map(
        (a) => a.questionId,
      );

      const missingRequiredQuestions = requiredQuestions.filter(
        (q) => !answeredQuestionIds?.includes(q.questionId),
      );

      if (missingRequiredQuestions.length > 0) {
        const missingDetails: QuestionDto[] = [];
        for (const question of missingRequiredQuestions) {
          const questionDetails: QuestionDto =
            await this.questionService.getQuestionDetailsById(
              question.questionId,
            );
          console.log('Missing required question details:', questionDetails);

          missingDetails.push(questionDetails);
        }

        throw new BadRequestException({
          message: 'You must answer all required questions.',
          missingRequiredQuestions: missingDetails,
        });
      }
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
}
