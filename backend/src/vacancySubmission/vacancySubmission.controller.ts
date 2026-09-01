import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';
import { CreateVacancySubmissionDto } from './dto/createVacancySubmission.dto';
import { MatchScoreExplanationDto } from './dto/matchScoreExplanation.dto';
import { VacancySubmissionDto } from '../vacancySubmission/dto/vacancySubmission.dto';
import { VacancySubmissionService } from './vacancySubmission.service';
import { validateTenantAccess } from '../utils/validate';
import { VacancySubmissionFilterDto } from './dto/vacancySubmissionFilter.dto';
import { VacancyService } from '../vacancy/vacancy.service';
import { extractUserTenantId } from '../utils/extractUserTenantId';
import { SubmissionRatingDto } from './dto/submissionRating.dto';
import { CandidateProfileService } from '../candidateProfile/candidateProfile.service';
import { UploadResume } from '../utils/upload-resume.decorator';
import {
  SubmissionSortQueryDto,
  SubmissionTenantSortQueryDto,
} from './dto/submissionSortQuery.dto';

@Controller('vacanciesSubmissions')
export class VacancySubmissionController {
  constructor(
    private readonly vacancySubmissionService: VacancySubmissionService,
    private readonly vacancyService: VacancyService,
    private readonly candidateProfileService: CandidateProfileService,
  ) {}

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get(':submissionId')
  async findOneById(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancySubmissionDto> {
    const submissionTenantId =
      await this.vacancySubmissionService.getTenantIdBySubmissionId(
        submissionId,
      );

    validateTenantAccess(requester, submissionTenantId);

    return await this.vacancySubmissionService.findSubmissionById(submissionId);
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post(':submissionId/approve')
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

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post(':submissionId/reject')
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
    @Query() sortQuery: SubmissionTenantSortQueryDto,
    @Body() filterSubmissionsDto?: VacancySubmissionFilterDto,
  ): Promise<VacancySubmissionDto[]> {
    const resolvedTenantId = extractUserTenantId(viewer, sortQuery.tenantId);

    validateTenantAccess(viewer, resolvedTenantId);

    return await this.vacancySubmissionService.findAllSubmissionsWithinTenantWithFilters(
      resolvedTenantId,
      filterSubmissionsDto,
      sortQuery.sortBy,
      sortQuery.order,
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
    @Query() sortQuery?: SubmissionSortQueryDto,
    @Body() filterSubmissionsDto?: VacancySubmissionFilterDto,
  ): Promise<VacancySubmissionDto[]> {
    const vacancyTenantId =
      await this.vacancyService.getTenantIdByVacancyId(vacancyId);

    validateTenantAccess(viewer, vacancyTenantId);

    return await this.vacancySubmissionService.findAllSubmissionsWithinVacancyWithFilters(
      vacancyId,
      filterSubmissionsDto,
      sortQuery?.sortBy,
      sortQuery?.order,
    );
  }

  /** Returns cities of all candidates who submitted to this vacancy */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get(':vacancyId/existing-cities')
  async getAllSubmissionsCitiesByVacancyId(
    @AuthUser() viewer: UserDto,
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
  ): Promise<string[]> {
    const vacancyTenantId =
      await this.vacancyService.getTenantIdByVacancyId(vacancyId);

    validateTenantAccess(viewer, vacancyTenantId);

    return await this.vacancySubmissionService.getAllSubmissionsCitiesByVacancyId(
      vacancyId,
    );
  }

  /** Returns countries of all candidates who submitted to this vacancy */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get(':vacancyId/existing-countries')
  async getAllSubmissionsCountriesByVacancyId(
    @AuthUser() viewer: UserDto,
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
  ): Promise<string[]> {
    const vacancyTenantId =
      await this.vacancyService.getTenantIdByVacancyId(vacancyId);

    validateTenantAccess(viewer, vacancyTenantId);

    return await this.vacancySubmissionService.getAllSubmissionsCountriesByVacancyId(
      vacancyId,
    );
  }

  // Returns all existing languages' codes across all submissions within vacancy
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get(':vacancyId/existing-languages-codes')
  async findAllExistingLanguagesCodes(
    @AuthUser() requester: UserDto,
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
  ): Promise<string[]> {
    const vacancyTenantId =
      await this.vacancyService.getTenantIdByVacancyId(vacancyId);

    validateTenantAccess(requester, vacancyTenantId);

    return await this.vacancySubmissionService.getAllExistingLanguagesCodes(
      vacancyId,
    );
  }

  @Roles(UserRole.recruiter)
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
  @Roles(UserRole.recruiter)
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

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
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
  @Post(':submissionId/parse-resume-file')
  @UploadResume()
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

    return await this.vacancySubmissionService.parseResumeFile(
      submissionId,
      file,
    );
  }

  @Roles(UserRole.admin, UserRole.recruiter, UserRole.superAdmin)
  @Post('calculate-match-score/:submissionId')
  async calculateMatchScoreForSubmission(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() requester: UserDto,
  ): Promise<VacancySubmissionDto> {
    const submissionTenantId =
      await this.vacancySubmissionService.getTenantIdBySubmissionId(
        submissionId,
      );

    validateTenantAccess(requester, submissionTenantId);

    return await this.vacancySubmissionService.recalculateMatchScore(
      submissionId,
    );
  }

  @Roles(UserRole.candidate)
  @Get(':submissionId/match-score')
  async showMatchScoreBySubmissionId(
    @Param('submissionId', new ParseUUIDPipe()) submissionId: string,
    @AuthUser() candidate: UserDto,
  ): Promise<MatchScoreExplanationDto> {
    return this.vacancySubmissionService.getMatchScoreExplanation(
      submissionId,
      candidate.id,
    );
  }

  @Roles(UserRole.candidate)
  @Post(':vacancyId')
  async create(
    @Body() createVacancySubmissionDto: CreateVacancySubmissionDto,
    @Param('vacancyId', new ParseUUIDPipe()) vacancyId: string,
    @AuthUser() user: UserDto,
  ): Promise<VacancySubmissionDto> {
    return await this.vacancySubmissionService.create(
      createVacancySubmissionDto,
      vacancyId,
      user.id,
    );
  }
}
