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
import { UserService } from '../../user/user.service';
import { CandidateProfileService } from './candidateProfile.service';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';

@Controller('candidatesProfiles')
export class CandidateProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly candidateProfileService: CandidateProfileService,
  ) {}

  // @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  // @Get('candidates')

  @Post('candidate')
  createCandidate(
    @Body() createCandidateDto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    return this.candidateProfileService.createCandidate(createCandidateDto);
  }

  @Roles(UserRole.candidate)
  @Patch('candidate/:userId')
  async updateCandidate(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) candidateId: string,
    @Body() updateCandidateProfileDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    const user = await this.userService.findById(requester.id);
    const candidateProfileId = user.candidateProfile?.id;

    if (candidateProfileId !== candidateId) {
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
