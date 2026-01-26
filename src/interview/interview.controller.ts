import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AuthUser } from 'src/decorators/authUser.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Interview } from 'src/entities/interview';
import { UserRole } from 'src/entities/role.enum';
import { UpdateInterviewDto } from 'src/interview/dto/updateInterview.dto';
import { InterviewService } from 'src/interview/interview.service';
import { UserDto } from 'src/user/dto/user.dto';
import { validateTenantAccess } from 'src/utils/validate';

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
