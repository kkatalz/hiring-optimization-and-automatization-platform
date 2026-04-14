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
import { GeneralVacancyDto } from '../vacancy/dto/generalVacancy.dto';
import { VacancyQuestionDto } from '../vacancy/dto/vacancyQuestion.dto';
import { VacancyService } from '../vacancy/vacancy.service';
import { CreateVacancyQuestionDto } from './dto/createVacancyQuestion.dto';
import { VacancyQuestionDetailedDto } from './dto/vacancyQuestionDetailed.dto';
import { VacancyFilterDto } from './dto/vacancyFilter.dto';
import { PaginatedResponse, PaginationQueryDto } from '../types/pagination';
import {
  VacancySortPaginationQueryDto,
  VacancyWithQuestionsPaginationQueryDto,
} from './dto/vacancyPaginationQuery.dto';

@Controller('vacancies')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  // When creating a vacancy, tenantId is derived from the creator's tenantId.
  @Roles(UserRole.admin, UserRole.recruiter)
  @Post()
  create(
    @Body() createVacancyDto: CreateVacancyDto,
    @AuthUser() creator: UserDto,
  ): Promise<VacancyDto> {
    return this.vacancyService.create(createVacancyDto, creator);
  }

  /**
   * Returns vacancies scoped to the requester's tenant.
   * SuperAdmins see all vacancies across tenants.
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get()
  findAllVacancies(
    @AuthUser() requester: UserDto,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<VacancyDto>> {
    const tenantId =
      requester.role === UserRole.superAdmin ? undefined : requester.tenantId;
    return this.vacancyService.findAll(
      tenantId,
      pagination.page,
      pagination.limit,
    );
  }

  @Roles(
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.recruiter,
    UserRole.candidate,
  )
  @Get('browse')
  browseAllVacancies(
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<GeneralVacancyDto>> {
    return this.vacancyService.findAllForBrowse(
      pagination.page,
      pagination.limit,
    );
  }

  /**
   * Returns filtered vacancies scoped to the requester's tenant.
   * SuperAdmins see all vacancies across tenants.
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post('search')
  searchVacancies(
    @Body() filterDto: VacancyFilterDto,
    @AuthUser() requester: UserDto,
    @Query() query: VacancySortPaginationQueryDto,
  ): Promise<PaginatedResponse<VacancyDto>> {
    const tenantId =
      requester.role === UserRole.superAdmin ? undefined : requester.tenantId;
    return this.vacancyService.findAllWithFilters(
      filterDto,
      query.sortBy,
      query.order,
      tenantId,
      query.page,
      query.limit,
    );
  }

  @Roles(
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.recruiter,
    UserRole.candidate,
  )
  @Post('browse/search')
  browseVacanciesWithFilters(
    @Body() filterDto: VacancyFilterDto,
    @Query() query: VacancySortPaginationQueryDto,
  ): Promise<PaginatedResponse<GeneralVacancyDto>> {
    return this.vacancyService.findAllWithFiltersForBrowse(
      filterDto,
      query.sortBy,
      query.order,
      query.page,
      query.limit,
    );
  }

  /**
   * When fetching vacancies with submissions, we only return those that belong to the requester's tenant,
   *  unless the requester is a superAdmin who can see all vacancies across tenants.
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('with-submissions')
  findVacanciesWithSubmissions(
    @AuthUser() requester: UserDto,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<VacancyDto>> {
    return this.vacancyService.findVacanciesWithSubmissions(
      requester.id,
      pagination.page,
      pagination.limit,
    );
  }

  /**
   * Super admins can optionally filter by tenantId to see vacancies with questions for a specific tenant.
   * If super admin does not provide tenantId, they will see all vacancies with questions across all tenants.
   *
   * Admins and recruiters will only see vacancies with questions for their own tenant.
   * If they provide a tenantId that does not match their own, they will receive an access error.
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('with-questions')
  async findAllVacanciesThatHaveQuestions(
    @AuthUser() requester: UserDto,
    @Query() query: VacancyWithQuestionsPaginationQueryDto,
  ): Promise<PaginatedResponse<VacancyDto>> {
    if (query.tenantId) {
      validateTenantAccess(requester, query.tenantId);
    }

    const extractedTenantId = query.tenantId ?? requester.tenantId;

    return await this.vacancyService.findAllVacanciesThatHaveQuestions(
      extractedTenantId,
      query.page,
      query.limit,
    );
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('tenant/:tenantId')
  findVacanciesByTenantId(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @AuthUser() viewer: UserDto,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<VacancyDto>> {
    validateTenantAccess(viewer, tenantId);
    return this.vacancyService.findAllByTenantId(
      tenantId,
      pagination.page,
      pagination.limit,
    );
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('all-questions/:vacancyId')
  async findAllQuestionsByVacancyId(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancyQuestionDetailedDto[]> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);
    validateTenantAccess(requester, vacancy.tenantId);

    return await this.vacancyService.findAllQuestionsByVacancyId(vacancyId);
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get(':vacancyId')
  async findByVacancyId(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancyDto> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);
    validateTenantAccess(requester, vacancy.tenantId);
    return vacancy;
  }

  @Roles(
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.recruiter,
    UserRole.candidate,
  )
  @Get('browse/:vacancyId')
  browseVacancyById(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
  ): Promise<GeneralVacancyDto> {
    return this.vacancyService.findVacancyByIdForBrowse(vacancyId);
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
  ): Promise<VacancyDto> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);
    validateTenantAccess(deletedBy, vacancy.tenantId);

    return await this.vacancyService.remove(vacancyId);
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
