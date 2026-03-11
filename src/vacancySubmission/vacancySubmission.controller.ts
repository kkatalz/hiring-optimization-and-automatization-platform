import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { SubmissionRatingDto } from './dto/submissionRating.dto';
import { CandidateProfileService } from '../candidateProfile/candidateProfile.service';

@Controller('vacanciesSubmissions')
export class VacancySubmissionController {
  constructor(
    private readonly vacancySubmissionService: VacancySubmissionService,
    private readonly vacancyService: VacancyService,
    private readonly candidateProfileService: CandidateProfileService,
  ) {}

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

  /**
   * Filter submissions by Candidate fields: minYearsOfExperience, maxYearsOfExperience, countries, cities, languages
   * Sort by submissionDate (createdAt), expectedSalary, recruiterRating, matchScore.
   */
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
   * Filter submissions by Candidate fields: minYearsOfExperience, maxYearsOfExperience, countries, cities, languages.
   * Sort by submissionDate (createdAt), expectedSalary, recruiterRating, matchScore.
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

  @Roles(UserRole.superAdmin, UserRole.recruiter)
  @Post('add-recruiter-rating/:submissionId')
  async addRecruiterRatingToSubmission(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() recruiter: UserDto,
    @Body() submissionRatingDto: SubmissionRatingDto,
  ): Promise<VacancySubmissionDto> {
    const submissionTenantId =
      await this.vacancySubmissionService.getTenantIdBySubmissionId(
        submissionId,
      );

    validateTenantAccess(recruiter, submissionTenantId);

    return await this.vacancySubmissionService.addRecruiterRating(
      submissionId,
      recruiter.id,
      submissionRatingDto.rating,
    );
  }
  @Roles(UserRole.superAdmin, UserRole.recruiter)
  @Patch('update-recruiter-rating/:submissionId')
  async updateRecruiterRatingToSubmission(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() recruiter: UserDto,
    @Body() submissionRatingDto: SubmissionRatingDto,
  ): Promise<VacancySubmissionDto> {
    const submissionTenantId =
      await this.vacancySubmissionService.getTenantIdBySubmissionId(
        submissionId,
      );

    validateTenantAccess(recruiter, submissionTenantId);

    return await this.vacancySubmissionService.updateRecruiterRating(
      submissionId,
      recruiter.id,
      submissionRatingDto.rating,
    );
  }

  @Roles(UserRole.superAdmin, UserRole.recruiter)
  @Delete('remove-recruiter-rating/:submissionId')
  async removeRecruiterRatingToSubmission(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() recruiter: UserDto,
  ): Promise<VacancySubmissionDto> {
    const submissionTenantId =
      await this.vacancySubmissionService.getTenantIdBySubmissionId(
        submissionId,
      );

    validateTenantAccess(recruiter, submissionTenantId);

    return await this.vacancySubmissionService.removeRecruiterRating(
      submissionId,
    );
  }

  @Roles(UserRole.candidate)
  @Patch(':submissionId/parse-resume-file')
  @UseInterceptors(FileInterceptor('file'))
  async parseResumeFile(
    @AuthUser() requester: UserDto,
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<VacancySubmissionDto> {
    // Verify the submission belongs to the requesting candidate
    const submission =
      await this.vacancySubmissionService.findOneById(submissionId);
    const candidateProfile =
      await this.candidateProfileService.findCandidateByUserId(requester.id);

    if (submission.candidateId !== candidateProfile.id) {
      throw new ForbiddenException(
        'Candidates can upload resumes only for their own submissions.',
      );
    }

    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      throw new BadRequestException(
        'Unsupported file type. Only PDF and DOCX are allowed.',
      );
    }

    return await this.vacancySubmissionService.parseResumeFile(
      submissionId,
      file,
      extension,
    );
  }

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
}
