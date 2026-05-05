import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { Interview } from '../entities/interview';
import { UserRole } from '../entities/role.enum';
import { CreateInterviewDto } from '../interview/dto/createInterview.dto';
import { InterviewViewDto } from '../interview/dto/interviewView.dto';
import { UpdateInterviewDto } from '../interview/dto/updateInterview.dto';
import { InterviewService } from '../interview/interview.service';
import { UserDto } from '../user/dto/user.dto';
import { validateTenantAccess } from '../utils/validate';

@Controller('interviews')
export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  @Roles(UserRole.admin, UserRole.recruiter)
  @Get()
  async getAllInterviews(@AuthUser() viewer: UserDto): Promise<Interview[]> {
    if (!viewer.tenantId) {
      throw new Error('Viewer does not belong to a tenant');
    }

    return await this.interviewService.getAllInterviews(viewer.tenantId);
  }

  @Roles(
    UserRole.admin,
    UserRole.recruiter,
    UserRole.candidate,
    UserRole.superAdmin,
  )
  @Get('me')
  async getMyInterviews(
    @AuthUser() viewer: UserDto,
  ): Promise<InterviewViewDto[]> {
    return this.interviewService.getMyInterviews(viewer);
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Post()
  async scheduleInterview(
    @AuthUser() recruiter: UserDto,
    @Body() createInterviewDto: CreateInterviewDto,
  ): Promise<Interview> {
    return this.interviewService.scheduleInterview(
      createInterviewDto,
      recruiter,
    );
  }

  @Roles(UserRole.admin, UserRole.recruiter)
  @Patch(':id/interview-status')
  async updateInterviewStatus(
    @AuthUser() updater: UserDto,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    const interviewTenantId =
      await this.interviewService.getTenantIdByInterviewId(id);

    validateTenantAccess(updater, interviewTenantId);

    return this.interviewService.updateInterviewStatus(
      id,
      updateInterviewDto.status,
      updateInterviewDto.notes,
    );
  }
}
