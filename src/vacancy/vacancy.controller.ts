import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';
import { validateTenantAccess } from '../utils/validate';
import { CreateVacancyDto } from '../vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { VacancyQuestionDto } from '../vacancy/dto/vacancyQuestion.dto';
import { VacancyService } from '../vacancy/vacancy.service';
import { CreateVacancyQuestionDto } from './dto/createVacancyQuesion.dto';

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
    return this.vacancyService.findVacanciesWithSubmissions(requester.id);
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('with-questions')
  async findAllVacanciesThatHaveQuestions(
    @AuthUser() requester: UserDto,
    @Query('tenantId') tenantId?: string,
  ): Promise<VacancyDto[]> {
    if (tenantId) {
      validateTenantAccess(requester, tenantId);
    }

    const extractedTenantId = tenantId ?? requester.tenantId;

    return await this.vacancyService.findAllVacanciesThatHaveQuestions(
      extractedTenantId,
    );
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
    return this.vacancyService.findVacancyById(vacancyId);
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Patch(':vacancyId')
  async update(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
    @AuthUser() updatedBy: UserDto,
  ): Promise<VacancyDto> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);
    validateTenantAccess(updatedBy, vacancy.tenantId);

    return this.vacancyService.update(vacancyId, updateVacancyDto);
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Delete(':vacancyId')
  async delete(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @AuthUser() deletedBy: UserDto,
  ): Promise<void> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);
    validateTenantAccess(deletedBy, vacancy.tenantId);

    await this.vacancyService.remove(vacancyId);
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post(':vacancyId/questions/:questionId')
  async addQuestionToVacancy(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @Param('questionId', new ParseUUIDPipe()) questionId: string,
    @Body() body: CreateVacancyQuestionDto,
    @AuthUser() requester: UserDto,
  ): Promise<VacancyQuestionDto> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);
    validateTenantAccess(requester, vacancy.tenantId);

    return await this.vacancyService.addQuestionToVacancy(
      vacancyId,
      questionId,
      body,
    );
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Delete(':vacancyId/questions/:questionId')
  async removeQuestionFromVacancy(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @Param('questionId', new ParseUUIDPipe()) questionId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancyQuestionDto> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);
    validateTenantAccess(requester, vacancy.tenantId);

    return await this.vacancyService.removeQuestionFromVacancy(
      vacancyId,
      questionId,
    );
  }
}
