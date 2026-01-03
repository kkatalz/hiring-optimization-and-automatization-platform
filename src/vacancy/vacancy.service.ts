import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vacancy } from '../entities/vacancy';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { CreateVacancyDto } from '../vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { UserDto } from '../user/dto/user.dto';
import { UserRole } from '../entities/role.enum';
import { vacancyToVacancyDto } from '../vacancy/map/vacancy.map';

@Injectable()
export class VacancyService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {}

  async findAll(): Promise<VacancyDto[]> {
    const vacancies = await this.vacancyRepository.find();
    return vacancies.map(vacancyToVacancyDto);
  }

  async findVacanciesWithSubmissions(
    requester: UserDto,
  ): Promise<VacancyDto[]> {
    const vacancyQuery = this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoinAndSelect('vacancy.submissions', 'submission');

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

  async findDtoByVacancyId(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancyToVacancyDto(vacancy);
  }

  async findAllByTenantId(tenantId: string): Promise<VacancyDto[]> {
    const vacanciesWithGivenTenant = await this.vacancyRepository.find({
      where: { tenantId },
    });

    if (vacanciesWithGivenTenant.length === 0) {
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
    const vacancy = this.vacancyRepository.create(createVacancyDto);

    if (creator.tenantId) vacancy.tenantId = creator.tenantId;
    vacancy.createdById = creator.id;
    vacancy.createdBy = creator;

    const savedVacancy = await this.vacancyRepository.save(vacancy);
    return vacancyToVacancyDto(savedVacancy);
  }

  async update(
    vacancy: Vacancy,
    updateVacancyDto: UpdateVacancyDto,
  ): Promise<VacancyDto> {
    Object.assign(vacancy, updateVacancyDto);

    const updatedVacancy = await this.vacancyRepository.save(vacancy);
    return vacancyToVacancyDto(updatedVacancy);
  }

  async remove(vacancy: Vacancy): Promise<VacancyDto> {
    await this.vacancyRepository.delete(vacancy.id);

    return vacancyToVacancyDto(vacancy);
  }
}
