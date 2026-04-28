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
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);

    validateTenantAccess(requester, vacancy.tenantId);

    await this.clusteringService.clusterSubmissions(vacancy);

    return { message: 'Clustering completed successfully.' };
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get('similar/:submissionId')
  async findSimilar(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancySubmissionDto[]> {
    const submission =
      await this.vacancySubmissionService.findOneById(submissionId);

    validateTenantAccess(requester, submission.tenantId);

    return this.clusteringService.findSimilar(submission);
  }
}
