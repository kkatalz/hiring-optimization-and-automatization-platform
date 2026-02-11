import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../entities/role.enum';
import { VacancySubmission } from '../entities/vacancySubmission';
import { UserDto } from '../user/dto/user.dto';
import { VacancyService } from '../vacancy/vacancy.service';
import { CreateVacancySubmissionDto } from './dto/createVacancySubmission.dto';
import { VacancySubmissionDto } from './dto/vacancySubmission.dto';
import { vacancySubmToVacancySubmDto } from './map/vacancySubmission.map';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { VacancySubmissionStatus } from '../entities/statuses.enum';
import { CandidateProfileService } from '../candidateProfile/candidate-profile/candidateProfile.service';

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
    user: UserDto,
  ): Promise<VacancySubmissionDto> {
    const candidate = await this.profileService.findCandidateByUserId(user.id);

    const vacancy = await this.vacancyService.findVacancyById(vacancyId);

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

  async findAll(viewerId: string): Promise<VacancySubmissionDto[]> {
    const viewer = await this.userService.findById(viewerId);

    if (viewer.role === UserRole.superAdmin) {
      const vacancySubmissions = await this.vacancySubmissionRepository.find();

      return vacancySubmissions.map(vacancySubmToVacancySubmDto);
    } else if (
      viewer.role === UserRole.admin ||
      viewer.role === UserRole.recruiter
    ) {
      const vacancySubmissions = await this.vacancySubmissionRepository.find({
        where: {
          vacancy: {
            tenantId: viewer.tenantId,
          },
        },
      });
      return vacancySubmissions.map(vacancySubmToVacancySubmDto);
    }
    return [];
  }

  async findAllByTenantId(tenantId: string): Promise<VacancySubmissionDto[]> {
    const vacancySubmissions = await this.vacancySubmissionRepository.find({
      where: { vacancy: { tenantId } },
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
