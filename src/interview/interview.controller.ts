import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { Interview } from '../entities/interview';
import { UserRole } from '../entities/role.enum';
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

  @Roles(UserRole.admin, UserRole.recruiter)
  @Patch(':id/interview-status')
  async updateInterviewStatus(
    @AuthUser() updater: UserDto,
    @Param('id') id: string,
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
