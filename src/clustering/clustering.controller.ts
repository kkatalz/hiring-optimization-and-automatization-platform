import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';
import { VacancySubmissionDto } from '../vacancySubmission/dto/vacancySubmission.dto';
import { ClusteringService } from './clustering.service';
import { VacancyService } from '../vacancy/vacancy.service';
import { validateTenantAccess } from '../utils/validate';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';

@Controller('clustering')
export class ClusteringController {
  constructor(
    private readonly clusteringService: ClusteringService,
    private readonly vacancyService: VacancyService,
    private readonly vacancySubmissionService: VacancySubmissionService,
  ) {}

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post('run/:vacancyId')
  async runClustering(
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @AuthUser() requester: UserDto,
  ): Promise<{ message: string }> {
    const vacancyTenantId =
      await this.vacancyService.getTenantIdByVacancyId(vacancyId);

    validateTenantAccess(requester, vacancyTenantId);

    await this.clusteringService.clusterSubmissions(vacancyId);

    return { message: 'Clustering completed successfully.' };
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('similar/:submissionId')
  async findSimilar(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancySubmissionDto[]> {
    const tenantId =
      await this.vacancySubmissionService.getTenantIdBySubmissionId(
        submissionId,
      );

    validateTenantAccess(requester, tenantId);

    return this.clusteringService.findSimilar(submissionId);
  }
}
