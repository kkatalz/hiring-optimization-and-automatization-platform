import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../entities/role.enum';
import { VacancySubmission } from '../entities/vacancySubmission';
import { UserDto } from '../user/dto/user.dto';
import { VacancyService } from '../vacancy/vacancy.service';
import { CreateVacancySubmissionDto } from '../vacancySubmission/dto/applyForVacancy.dto';
import { VacancySubmissionDto } from '../vacancySubmission/dto/vacancySubmission.dto';
import { vacancySubmToVacancySubmDto } from '../vacancySubmission/map/vacancySubmission.map';
import { Repository } from 'typeorm';

@Injectable()
export class VacancySumbissionService {
  constructor(
    @InjectRepository(VacancySubmission)
    private readonly vacancySubmissionRepository: Repository<VacancySubmission>,

    private readonly vacancyService: VacancyService,
  ) {}

  async create(
    createVacancySubmissionDto: CreateVacancySubmissionDto,
    vacancyId: string,
    candidate: UserDto,
  ): Promise<VacancySubmissionDto> {
    await this.vacancyService.findVacancyById(vacancyId);

    const vacancySubmission = this.vacancySubmissionRepository.create(
      createVacancySubmissionDto,
    );

    vacancySubmission.vacancyId = vacancyId;
    vacancySubmission.candidateId = candidate.id;

    const savedVacancySubmission =
      await this.vacancySubmissionRepository.save(vacancySubmission);

    return vacancySubmToVacancySubmDto(savedVacancySubmission);
  }

  async findAll(viewer: UserDto): Promise<VacancySubmissionDto[]> {
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
}
