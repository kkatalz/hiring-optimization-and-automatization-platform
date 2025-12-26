import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/entities/role.enum';
import { VacancySubmission } from 'src/entities/vacancySubmission';
import { UserDto } from 'src/user/dto/user.dto';
import { VacancyService } from 'src/vacancy/vacancy.service';
import { CreateVacancySubmissionDto } from 'src/vacancySubmission/dto/applyForVacancy.dto';
import { VacancySubmissionDto } from 'src/vacancySubmission/dto/vacancySubmission.dto';
import { vacancySubmToVacancySubmDto } from 'src/vacancySubmission/map/vacancySubmission.map';
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
    await this.vacancyService.findDtoByVacancyId(vacancyId);

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

      return vacancySubmissions.map((single) =>
        vacancySubmToVacancySubmDto(single),
      );
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
      return vacancySubmissions.map((single) =>
        vacancySubmToVacancySubmDto(single),
      );
    }
    return [];
  }

  async findAllByTenantId(tenantId: string): Promise<VacancySubmissionDto[]> {
    const vacancySubmissions = await this.vacancySubmissionRepository.find({
      where: { vacancy: { tenantId } },
    });
    return vacancySubmissions.map((single) =>
      vacancySubmToVacancySubmDto(single),
    );
  }
}
