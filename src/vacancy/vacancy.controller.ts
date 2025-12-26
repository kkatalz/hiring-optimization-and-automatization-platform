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
import { AuthUser } from 'src/decorators/authUser.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/entities/role.enum';
import { Vacancy } from 'src/entities/vacancy';
import { UserDto } from 'src/user/dto/user.dto';
import { validateTenantAccess } from 'src/utils/validate';
import { CreateVacancyDto } from 'src/vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from 'src/vacancy/dto/updateVacancy.dto';
import { VacancyDto } from 'src/vacancy/dto/vacancy.dto';
import { VacancyService } from 'src/vacancy/vacancy.service';

@Controller('vacancies')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Roles(UserRole.admin, UserRole.recruiter)
  @Post()
  create(
    @Body() createVacancyDto: CreateVacancyDto,
    @AuthUser() creator: UserDto,
  ): Promise<Vacancy> {
    return this.vacancyService.create(createVacancyDto, creator);
  }

  @Get()
  findAllVacancies(): Promise<VacancyDto[]> {
    return this.vacancyService.findAll();
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('detailed')
  findAllVacanciesDetailed(@AuthUser() viewer: UserDto): Promise<VacancyDto[]> {
    return this.vacancyService.findAllDetailed(viewer);
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
  update(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
    @AuthUser() updatedBy: UserDto,
  ): Promise<VacancyDto> {
    return this.vacancyService.update(vacancyId, updateVacancyDto, updatedBy);
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Delete(':vacancyId')
  delete(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @AuthUser() deletedBy: UserDto,
  ): Promise<VacancyDto> {
    return this.vacancyService.remove(vacancyId, deletedBy);
  }
}
