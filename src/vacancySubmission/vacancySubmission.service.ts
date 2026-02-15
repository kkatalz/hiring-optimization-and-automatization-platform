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
import { UserService } from '../user/user.service';
import { VacancySubmissionStatus } from '../entities/statuses.enum';
import { CandidateProfileService } from '../candidateProfile/candidate-profile/candidateProfile.service';
import { RecruitingFilterDto } from '../recruiting/recruitingFilter.dto';
import {
  filterByExperienceCountriesCities,
  meetsLanguageRequirement,
} from '../utils/filterSubmissionsAndCandidateProfiles';

@Injectable()
export class VacancySubmissionService {
  constructor(
    @InjectRepository(VacancySubmission)
    private readonly vacancySubmissionRepository: Repository<VacancySubmission>,

    private readonly vacancyService: VacancyService,

    private readonly userService: UserService,

    private readonly profileService: CandidateProfileService,
  ) {}

  async create(
    createVacancySubmissionDto: CreateVacancySubmissionDto,
    vacancyId: string,
    userId: string,
  ): Promise<VacancySubmissionDto> {
    const candidate = await this.profileService.findCandidateByUserId(userId);

    const vacancy = await this.vacancyService.findVacancyById(vacancyId);

    // Allow to create submission only if candidate hasn't already applied
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

    // Validate that Submission has only allowed tags in Vacancy
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
      .where('submission.vacancy_id = :vacancyId', { vacancyId });

    const filteredQuery = filterByExperienceCountriesCities(
      query,
      filterSubmissionsDto,
    );

    let submissions = await filteredQuery.getMany();

    // Filter by languages — filter submissions based on their candidate's languages
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

  async findAllByTenantId(tenantId: string): Promise<VacancySubmissionDto[]> {
    const vacancySubmissions = await this.vacancySubmissionRepository.find({
      where: { tenantId },
    });
    return vacancySubmissions.map(vacancySubmToVacancySubmDto);
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
}
