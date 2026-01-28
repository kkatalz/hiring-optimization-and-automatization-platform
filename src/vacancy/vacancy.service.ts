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
import { UserService } from '../user/user.service';

@Injectable()
export class VacancyService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<VacancyDto[]> {
    const vacancies = await this.vacancyRepository.find();
    return vacancies.map(vacancyToVacancyDto);
  }

  async findVacanciesWithSubmissions(
    requesterId: string,
  ): Promise<VacancyDto[]> {
    const requester = await this.userService.findById(requesterId);

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

  async findVacancyById(vacancyId: string): Promise<VacancyDto> {
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
    const vacancy = this.vacancyRepository.create(createVacancyDto);

    if (creator.tenantId) vacancy.tenantId = creator.tenantId;
    vacancy.createdById = creator.id;
    vacancy.createdBy = creator;

    const savedVacancy = await this.vacancyRepository.save(vacancy);
    return vacancyToVacancyDto(savedVacancy);
  }

  async update(
    vacancyId: string,
    updateVacancyDto: UpdateVacancyDto,
  ): Promise<VacancyDto> {
    const vacancy = await this.findVacancyById(vacancyId);

    const updatedFields = updateVacancyDto;
    Object.keys(updatedFields).forEach((key) => {
      if (updatedFields[key] !== undefined) {
        vacancy[key] = updatedFields[key];
      }
    });

    const updatedVacancy = await this.vacancyRepository.save(vacancy);
    return vacancyToVacancyDto(updatedVacancy);
  }

  async remove(vacancyId: string): Promise<void> {
    await this.findVacancyById(vacancyId);

    await this.vacancyRepository.delete(vacancyId);
  }
}
