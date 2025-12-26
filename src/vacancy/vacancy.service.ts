import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vacancy } from 'src/entities/vacancy';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VacancyDto } from 'src/vacancy/dto/vacancy.dto';
import { CreateVacancyDto } from 'src/vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from 'src/vacancy/dto/updateVacancy.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { validateTenantAccess } from 'src/utils/validate';
import { UserRole } from 'src/entities/role.enum';

@Injectable()
export class VacancyService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {}

  async findAll(): Promise<VacancyDto[]> {
    return await this.vacancyRepository.find();
  }

  async findVacanciesWithSubmissions(
    requester: UserDto,
  ): Promise<VacancyDto[]> {
    const vacanciesWithSubmissions = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoin('vacancy.submissions', 'submission')
      .getMany();

    if (requester.role === UserRole.superAdmin) return vacanciesWithSubmissions;
    else if (
      requester.role === UserRole.admin ||
      requester.role === UserRole.recruiter
    ) {
      return vacanciesWithSubmissions.filter(
        (vacancy) => vacancy.tenantId === requester.tenantId,
      );
    }
    return [];
  }

  async findDtoByVacancyId(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancy;
  }

  async findAllByTenantId(tenantId: string): Promise<VacancyDto[]> {
    const tenant = await this.vacancyRepository.find({
      where: { tenantId },
    });

    if (!tenant) {
      throw new HttpException(
        'No vacancies with provided tenant were found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const vacancies = await this.vacancyRepository.find({
      where: { tenantId },
    });
    return vacancies;
  }

  async create(
    createVacancyDto: CreateVacancyDto,
    creator: UserDto,
  ): Promise<VacancyDto> {
    const vacancy = this.vacancyRepository.create(createVacancyDto);

    if (creator.tenantId) vacancy.tenantId = creator.tenantId;
    vacancy.createdById = creator.id;
    vacancy.createdBy = creator;

    return await this.vacancyRepository.save(vacancy);
  }

  async update(
    vacancyId: string,
    updateVacancyDto: UpdateVacancyDto,
    updater: UserDto,
  ): Promise<VacancyDto> {
    const vacancy = await this.findVacancyByVacancyId(vacancyId);
    validateTenantAccess(updater, vacancy.tenantId);

    Object.assign(vacancy, updateVacancyDto);

    return await this.vacancyRepository.save(vacancy);
  }

  async remove(vacancyId: string, deleter: UserDto): Promise<VacancyDto> {
    const vacancy = await this.findVacancyByVacancyId(vacancyId);
    validateTenantAccess(deleter, vacancy.tenantId);

    await this.vacancyRepository.delete(vacancyId);

    return vacancy;
  }

  private async findVacancyByVacancyId(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancy;
  }
}
