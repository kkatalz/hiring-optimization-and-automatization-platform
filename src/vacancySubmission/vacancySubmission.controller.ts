import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';
import { CreateVacancySubmissionDto } from '../vacancySubmission/dto/applyForVacancy.dto';
import { VacancySubmissionDto } from '../vacancySubmission/dto/vacancySubmission.dto';
import { VacancySubmissionService } from '../vacancySubmission/vacancySumbission.service';

@Controller('vacanciesSubmissions')
export class VacancySubmissionController {
  constructor(
    private readonly vacancySubmissionService: VacancySubmissionService,
  ) {}

  @Roles(UserRole.candidate)
  @Post(':vacancyId')
  create(
    @Body() createVacancySubmissionDto: CreateVacancySubmissionDto,
    @Param('vacancyId') vacancyId: string,
    @AuthUser() candidate: UserDto,
  ): Promise<VacancySubmissionDto> {
    return this.vacancySubmissionService.create(
      createVacancySubmissionDto,
      vacancyId,
      candidate,
    );
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get()
  findAll(@AuthUser() viewer: UserDto): Promise<VacancySubmissionDto[]> {
    return this.vacancySubmissionService.findAll(viewer);
  }

  @Roles(UserRole.superAdmin)
  @Get(':tenantId')
  findAllByTenantId(
    @Param('tenantId') tenantId: string,
  ): Promise<VacancySubmissionDto[]> {
    return this.vacancySubmissionService.findAllByTenantId(tenantId);
  }
}
