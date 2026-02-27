import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';
import { CreateVacancySubmissionDto } from './dto/createVacancySubmission.dto';
import { VacancySubmissionDto } from '../vacancySubmission/dto/vacancySubmission.dto';
import { VacancySubmissionService } from './vacancySubmission.service';
import { validateTenantAccess } from '../utils/validate';
import { RecruitingFilterDto } from '../recruiting/recruitingFilter.dto';
import { VacancyService } from '../vacancy/vacancy.service';
import { extractUserTenantId } from '../utils/extractUserTenantId';

@Controller('vacanciesSubmissions')
export class VacancySubmissionController {
  constructor(
    private readonly vacancySubmissionService: VacancySubmissionService,
    private readonly vacancyService: VacancyService,
  ) {}

  @Roles(UserRole.candidate)
  @Post(':vacancyId')
  async create(
    @Body() createVacancySubmissionDto: CreateVacancySubmissionDto,
    @Param('vacancyId') vacancyId: string,
    @AuthUser() user: UserDto,
  ): Promise<VacancySubmissionDto> {
    return await this.vacancySubmissionService.create(
      createVacancySubmissionDto,
      vacancyId,
      user.id,
    );
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Post('approve/:submissionId')
  async approveVacancySubmission(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancySubmissionDto> {
    const submissionTenantId =
      await this.vacancySubmissionService.getTenantIdBySubmissionId(
        submissionId,
      );
    validateTenantAccess(requester, submissionTenantId);

    return await this.vacancySubmissionService.approve(submissionId);
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Post('reject/:submissionId')
  async rejectVacancySubmission(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancySubmissionDto> {
    const submissionTenantId =
      await this.vacancySubmissionService.getTenantIdBySubmissionId(
        submissionId,
      );

    validateTenantAccess(requester, submissionTenantId);

    return await this.vacancySubmissionService.reject(submissionId);
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post('get/filter/within/tenant')
  async findAllSubmissionsWithinTenant(
    @AuthUser() viewer: UserDto,
    @Body() filterSubmissionsDto?: RecruitingFilterDto,
    @Query('tenantId') tenantId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<VacancySubmissionDto[]> {
    const resolvedTenantId = extractUserTenantId(viewer, tenantId);

    return await this.vacancySubmissionService.findAllSubmissionsWithinTenantWithFilters(
      resolvedTenantId,
      filterSubmissionsDto,
      sortBy,
      order,
    );
  }

  /** Shows all submissions for superAdmin, and for admin/recruiter within given vacancy
   * Super admin can view all submissions across all tenants.
   * Admin and recruiter can only view submissions within their own tenant.
   * Filter submissions by Candidate fields: minYearsOfExperience, maxYearsOfExperience, countries, cities, languages
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post('get/filter/within/vacancy/:vacancyId')
  async findAllSubmissionsWithinVacancy(
    @AuthUser() viewer: UserDto,
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @Body() filterSubmissionsDto?: RecruitingFilterDto,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<VacancySubmissionDto[]> {
    const vacancyTenantId =
      await this.vacancyService.getTenantIdByVacancyId(vacancyId);

    validateTenantAccess(viewer, vacancyTenantId);

    return await this.vacancySubmissionService.findAllSubmissionsWithinVacancyWithFilters(
      vacancyId,
      filterSubmissionsDto,
      sortBy,
      order,
    );
  }
}
