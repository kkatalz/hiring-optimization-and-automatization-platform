import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthUser } from '../../decorators/authUser.dto';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../entities/role.enum';
import { UserDto } from '../../user/dto/user.dto';
import { CandidateProfileService } from './candidateProfile.service';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { CandidateProfileFilterDto } from './dto/candidateProfileFilter.dto';

@Controller('candidatesProfiles')
export class CandidateProfileController {
  constructor(
    private readonly candidateProfileService: CandidateProfileService,
  ) {}

  @Post('get')
  findAllCandidates(
    @Body() profileFilterDto?: CandidateProfileFilterDto,
  ): Promise<CandidateProfileDto[]> {
    return this.candidateProfileService.findAllCandidatesWithFilters(
      profileFilterDto,
    );
  }

  @Post('new')
  createCandidate(
    @Body() createCandidateDto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    return this.candidateProfileService.createCandidate(createCandidateDto);
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
