import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vacancy } from 'src/entities/vacancy';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VacancyDto } from 'src/vacancy/dto/vacancy.dto';
import { vacancyToVacancyDto } from 'src/vacancy/map/vacancy.map';
import { CreateVacancyDto } from 'src/vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from 'src/vacancy/dto/updateVacancy.dto';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class VacancyService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {}

  async findAll(): Promise<VacancyDto[]> {
    return await this.vacancyRepository.find();
  }

  async findByVacancyId(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancyToVacancyDto(vacancy);
  }

  async findByTenantId(tenantId: string): Promise<VacancyDto[]> {
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
    return vacancies.map(vacancyToVacancyDto);
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
  ): Promise<VacancyDto> {
    const vacancy = await this.findByVacancyId(vacancyId);

    Object.assign(vacancy, updateVacancyDto);

    return await this.vacancyRepository.save(vacancy);
  }

  async remove(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.findByVacancyId(vacancyId);
    await this.vacancyRepository.delete(vacancyId);

    return vacancy;
  }
}
