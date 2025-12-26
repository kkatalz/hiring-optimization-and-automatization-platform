import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthUser } from 'src/decorators/authUser.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/entities/role.enum';
import { UserDto } from 'src/user/dto/user.dto';
import { CreateVacancySubmissionDto } from 'src/vacancySubmission/dto/applyForVacancy.dto';
import { VacancySumbissionService } from 'src/vacancySubmission/vacancySumbission.service';

@Controller('vacanciesSubmissions')
export class VacancySubmissionController {
  constructor(
    private readonly vacancySumbissionService: VacancySumbissionService,
  ) {}

  @Roles(UserRole.candidate)
  @Post(':vacancyId')
  create(
    @Body() createVacancySubmissionDto: CreateVacancySubmissionDto,
    @Param('vacancyId') vacancyId: string,
    @AuthUser() candidate: UserDto,
  ) {
    return this.vacancySumbissionService.create(
      createVacancySubmissionDto,
      vacancyId,
      candidate,
    );
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get()
  findAll(@AuthUser() viewer: UserDto) {
    return this.vacancySumbissionService.findAll(viewer);
  }

  @Roles(UserRole.superAdmin)
  @Get(':tenantId')
  findAllByTenantId(@Param('tenantId') tenantId: string) {
    return this.vacancySumbissionService.findAllByTenantId(tenantId);
  }
}
