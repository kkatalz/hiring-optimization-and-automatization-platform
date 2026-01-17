import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../entities/role.enum';
import { VacancySubmission } from '../entities/vacancySubmission';
import { UserDto } from '../user/dto/user.dto';
import { VacancyService } from '../vacancy/vacancy.service';
import { CreateVacancySubmissionDto } from './dto/applyForVacancy.dto';
import { VacancySubmissionDto } from './dto/vacancySubmission.dto';
import { vacancySubmToVacancySubmDto } from './map/vacancySubmission.map';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { VacancySubmissionStatus } from '../entities/status.enum';

@Injectable()
export class VacancySubmissionService {
  constructor(
    @InjectRepository(VacancySubmission)
    private readonly vacancySubmissionRepository: Repository<VacancySubmission>,

    private readonly vacancyService: VacancyService,

    private readonly userService: UserService,
  ) {}

  async create(
    createVacancySubmissionDto: CreateVacancySubmissionDto,
    vacancyId: string,
    candidate: UserDto,
  ): Promise<VacancySubmissionDto> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);

    const vacancySubmission = this.vacancySubmissionRepository.create({
      ...createVacancySubmissionDto,
      vacancyId: vacancyId,
      candidateId: candidate.id,
      vacancy: vacancy,
      candidate: candidate,
    });

    const savedVacancySubmission =
      await this.vacancySubmissionRepository.save(vacancySubmission);

    return vacancySubmToVacancySubmDto(savedVacancySubmission);
  }

  async getTenantIdBySubmissionId(submissionId: string): Promise<string> {
    const submission = await this.vacancySubmissionRepository.findOne({
      where: { id: submissionId },
      relations: ['vacancy'],
    });

    if (!submission) {
      throw new HttpException(
        'Vacancy not found for the submission',
        HttpStatus.NOT_FOUND,
      );
    }

    return submission.vacancy.tenantId;
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

    submission.status = VacancySubmissionStatus.approved;

    return this.vacancySubmissionRepository.save(submission);
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

    submission.status = VacancySubmissionStatus.rejected;

    return await this.vacancySubmissionRepository.save(submission);
  }
}
