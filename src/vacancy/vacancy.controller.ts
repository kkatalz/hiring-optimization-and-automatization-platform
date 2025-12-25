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
  ): Promise<VacancyDto> {
    return this.vacancyService.create(createVacancyDto, creator);
  }

  @Get()
  findAllVacancies(): Promise<VacancyDto[]> {
    return this.vacancyService.findAll();
  }

  @Get(':vacancyId')
  findByVacancyId(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
  ): Promise<VacancyDto> {
    return this.vacancyService.findByVacancyId(vacancyId);
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('tenant/:tenantId')
  findVacanciesByTenantId(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @AuthUser() viewer: UserDto,
  ): Promise<VacancyDto[]> {
    validateTenantAccess(viewer, tenantId);
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
