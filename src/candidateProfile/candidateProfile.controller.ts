import {
  Body,
  Controller,
  ForbiddenException,
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
import { CandidateProfileService } from './candidateProfile.service';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { RecruitingFilterDto } from '../recruiting/recruitingFilter.dto';
import { validateTenantAccess } from '../utils/validate';

@Controller('candidatesProfiles')
export class CandidateProfileController {
  constructor(
    private readonly candidateProfileService: CandidateProfileService,
  ) {}

  @Roles(UserRole.candidate, UserRole.superAdmin)
  @Get(':candidateId/submissions')
  async findAllCandidateSubmissionsByCandidateId(
    @Param('candidateId', new ParseUUIDPipe()) candidateId: string,
    @AuthUser() requester: UserDto,
  ): Promise<CandidateProfileDto> {
    if (requester.role !== UserRole.superAdmin) {
      const candidate =
        await this.candidateProfileService.findCandidateByUserId(requester.id);

      if (candidate.id !== candidateId) {
        throw new ForbiddenException(
          'Candidates can view only their own submissions.',
        );
      }
    }
    return await this.candidateProfileService.findAllCandidateSubmissionsByCandidateId(
      candidateId,
    );
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post('get/within-tenant/filter')
  async findAllCandidates(
    @AuthUser() requester: UserDto,
    @Body() profileFilterDto?: RecruitingFilterDto,
    @Query('tenantId') tenantId?: string,
  ): Promise<CandidateProfileDto[]> {
    if (tenantId) validateTenantAccess(requester, tenantId);

    return await this.candidateProfileService.findAllCandidatesWithFilters(
      profileFilterDto,
      tenantId,
    );
  }

  @Post('new')
  async createCandidate(
    @Body() createCandidateDto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    return await this.candidateProfileService.createCandidate(
      createCandidateDto,
    );
  }

  @Roles(UserRole.candidate)
  @Patch(':userId')
  async updateCandidate(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) candidateId: string,
    @Body() updateCandidateProfileDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    if (requester.id !== candidateId) {
      throw new ForbiddenException(
        'Candidates can update only their own profiles.',
      );
    }

    return await this.candidateProfileService.updateCandidate(
      candidateId,
      updateCandidateProfileDto,
    );
  }
}
