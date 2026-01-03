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
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';
import { validateTenantAccess } from '../utils/validate';
import { CreateVacancyDto } from '../vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { VacancyService } from '../vacancy/vacancy.service';

@Controller('vacancies')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Roles(UserRole.admin, UserRole.recruiter)
  @Post()
  create(
    @Body() createVacancyDto: CreateVacancyDto,
    @AuthUser() creator: UserDto,
  ): Promise<VacancyDto> {
    return this.vacancyService.create(createVacancyDto, creator);
  }

  @Get()
  findAllVacancies(): Promise<VacancyDto[]> {
    return this.vacancyService.findAll();
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('with-submissions')
  findVacanciesWithSubmissions(
    @AuthUser() requester: UserDto,
  ): Promise<VacancyDto[]> {
    return this.vacancyService.findVacanciesWithSubmissions(requester);
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('tenant/:tenantId')
  findVacanciesByTenantId(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @AuthUser() viewer: UserDto,
  ): Promise<VacancyDto[]> {
    validateTenantAccess(viewer, tenantId);
    return this.vacancyService.findAllByTenantId(tenantId);
  }

  @Get(':vacancyId')
  findByVacancyId(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
  ): Promise<VacancyDto> {
    return this.vacancyService.findDtoByVacancyId(vacancyId);
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Patch(':vacancyId')
  async update(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
    @AuthUser() updatedBy: UserDto,
  ): Promise<VacancyDto> {
    const vacancy = await this.vacancyService.findDtoByVacancyId(vacancyId);
    validateTenantAccess(updatedBy, vacancy.tenantId);

    return this.vacancyService.update(vacancy, updateVacancyDto);
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Delete(':vacancyId')
  async delete(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @AuthUser() deletedBy: UserDto,
  ): Promise<VacancyDto> {
    const vacancy = await this.vacancyService.findDtoByVacancyId(vacancyId);
    validateTenantAccess(deletedBy, vacancy.tenantId);

    return this.vacancyService.remove(vacancy);
  }
}
