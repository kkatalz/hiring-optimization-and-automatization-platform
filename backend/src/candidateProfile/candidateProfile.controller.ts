import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
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
import { CandidateProfileService } from './candidateProfile.service';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { CandidateProfileFilterDto } from './dto/candidateProfileFilter.dto';
import { validateTenantAccess } from '../utils/validate';
import { UploadResume } from '../utils/upload-resume.decorator';

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
  @Post('filter')
  async findAllCandidates(
    @AuthUser() requester: UserDto,
    @Body() profileFilterDto?: CandidateProfileFilterDto,
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
  @Patch(':userId/parse-resume-file')
  @UploadResume()
  async parseResumeFile(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) candidateId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CandidateProfileDto> {
    if (requester.id !== candidateId) {
      throw new ForbiddenException(
        'Candidates can upload resumes only for their own profiles.',
      );
    }

    if (!file)
      throw new HttpException('File is required.', HttpStatus.BAD_REQUEST);

    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      throw new HttpException(
        'Unsupported file type. Only PDF and DOCX are allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.candidateProfileService.parseResumeFile(
      candidateId,
      file,
      extension,
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
