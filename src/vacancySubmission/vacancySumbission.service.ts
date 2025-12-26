import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/entities/role.enum';
import { VacancySubmission } from 'src/entities/vacancySubmission';
import { UserDto } from 'src/user/dto/user.dto';
import { VacancyService } from 'src/vacancy/vacancy.service';
import { CreateVacancySubmissionDto } from 'src/vacancySubmission/dto/applyForVacancy.dto';
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
  ) {
    await this.vacancyService.findDtoByVacancyId(vacancyId);

    const vacancySubmission = this.vacancySubmissionRepository.create(
      createVacancySubmissionDto,
    );

    vacancySubmission.vacancyId = vacancyId;
    vacancySubmission.candidateId = candidate.id;

    return await this.vacancySubmissionRepository.save(vacancySubmission);
  }

  async findAll(viewer: UserDto): Promise<VacancySubmission[]> {
    if (viewer.role === UserRole.superAdmin)
      return await this.vacancySubmissionRepository.find();
    else if (
      viewer.role === UserRole.admin ||
      viewer.role === UserRole.recruiter
    ) {
      return await this.vacancySubmissionRepository.find({
        where: {
          vacancy: {
            tenantId: viewer.tenantId,
          },
        },
      });
    }
    return [];
  }
}
