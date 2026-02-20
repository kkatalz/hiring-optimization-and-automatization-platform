import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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

  // Shows all submissions for superAdmin, and for admin/recruiter within given vacancy
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post('get/within/vacancy/:vacancyId/filter')
  async findAllSubmissionsWithinVacancy(
    @AuthUser() viewer: UserDto,
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @Body() filterSubmissionsDto?: RecruitingFilterDto,
  ): Promise<VacancySubmissionDto[]> {
    const vacancyTenantId =
      await this.vacancyService.getTenantIdByVacancyId(vacancyId);

    validateTenantAccess(viewer, vacancyTenantId);

    return await this.vacancySubmissionService.findAllSubmissionsWithinVacancyWithFilters(
      vacancyId,
      filterSubmissionsDto,
    );
  }

  @Roles(UserRole.superAdmin)
  @Get(':tenantId')
  async findAllByTenantId(
    @Param('tenantId') tenantId: string,
  ): Promise<VacancySubmissionDto[]> {
    return await this.vacancySubmissionService.findAllByTenantId(tenantId);
  }
}
