import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateVacancyDto } from 'src/vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from 'src/vacancy/dto/updateVacancy.dto';
import { VacancyDto } from 'src/vacancy/dto/vacancy.dto';
import { VacancyService } from 'src/vacancy/vacancy.service';

@Controller('vacancies')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Post()
  create(@Body() createVacancyDto: CreateVacancyDto): Promise<VacancyDto> {
    return this.vacancyService.create(createVacancyDto);
  }

  @Get()
  findAllVacancies(): Promise<VacancyDto[]> {
    return this.vacancyService.findAll();
  }

  @Get(':vacancyId')
  findVacanciesByVacancyId(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
  ): Promise<VacancyDto> {
    return this.vacancyService.findByVacancyId(vacancyId);
  }

  @Get('tenant/:tenantId')
  findVacanciesByTenantId(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
  ): Promise<VacancyDto[]> {
    return this.vacancyService.findByTenantId(tenantId);
  }

  @Patch(':vacancyId')
  update(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
  ): Promise<VacancyDto> {
    return this.vacancyService.update(vacancyId, updateVacancyDto);
  }

  @Delete(':vacancyId')
  delete(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
  ): Promise<VacancyDto> {
    return this.vacancyService.remove(vacancyId);
  }
}
