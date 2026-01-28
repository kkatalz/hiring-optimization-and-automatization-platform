import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
import { TenantInterceptor } from '../interceptors/tenantId.interceptor';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { validateTenantAccess } from '../utils/validate';
import { ChangeEmailDto } from './dto/changeEmail.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { CandidateProfileDto } from './dto/candidateProfile.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('candidate')
  createCandidate(
    @Body() createCandidateDto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    return this.userService.createCandidate(createCandidateDto);
  }

  @UseInterceptors(TenantInterceptor)
  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('recruiter')
  createRecruiter(@Body() createRecruiterDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createRecruiterDto, UserRole.recruiter);
  }

  @UseInterceptors(TenantInterceptor)
  @Roles(UserRole.superAdmin)
  @Post('admin')
  createAdmin(@Body() createAdminDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createAdminDto, UserRole.admin);
  }

  @Roles(UserRole.superAdmin)
  @Post('superAdmin')
  createSuperAdmin(
    @Body() createSuperAdminDto: CreateUserDto,
  ): Promise<UserDto> {
    return this.userService.create(createSuperAdminDto, UserRole.superAdmin);
  }

  @Roles(UserRole.superAdmin)
  @Get()
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Get('tenant/:id')
  findAllByTenantId(
    @AuthUser() requester: UserDto,
    @Param('id', new ParseUUIDPipe()) tenantId: string,
  ): Promise<UserDto[]> {
    validateTenantAccess(requester, tenantId);
    return this.userService.findAllByTenantId(tenantId);
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Get(':id')
  findById(
    @AuthUser() requester: UserDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserDto> {
    return this.userService.findDtoById(id, requester);
  }

  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Patch(':userId/tenant/:tenantId')
  update(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    this.validateAdminRecruiterForCredentialsAccess(
      requester,
      tenantId,
      userId,
    );

    return this.userService.update(userId, tenantId, updateUserDto);
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

    return await this.userService.updateCandidate(
      candidateId,
      updateCandidateProfileDto,
    );
  }

  @Roles(
    UserRole.candidate,
    UserRole.recruiter,
    UserRole.superAdmin,
    UserRole.admin,
  )
  @Patch('credentials/email/:userId')
  async changeEmail(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() changeEmailDto: ChangeEmailDto,
  ): Promise<UserDto> {
    const user = await this.userService.findById(userId);

    if (user.tenantId)
      this.validateAdminRecruiterForCredentialsAccess(
        requester,
        user.tenantId,
        user.id,
      );
    else this.validateCandidateSuperAdminForCredentialsAccess(requester, user);

    return await this.userService.changeEmail(userId, changeEmailDto);
  }

  @Roles(
    UserRole.candidate,
    UserRole.recruiter,
    UserRole.superAdmin,
    UserRole.admin,
  )
  @Patch('credentials/password/:userId')
  async changePassword(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserDto> {
    const user = await this.userService.findById(userId);

    if (user.tenantId)
      this.validateAdminRecruiterForCredentialsAccess(
        requester,
        user.tenantId,
        user.id,
      );
    else this.validateCandidateSuperAdminForCredentialsAccess(requester, user);

    return await this.userService.changePassword(userId, changePasswordDto);
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Delete(':userId/tenant/:tenantId')
  async remove(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
  ): Promise<void> {
    validateTenantAccess(requester, tenantId);
    await this.validateUserForRemoveAccess(requester, userId);

    await this.userService.remove(userId, tenantId);
  }

  private async validateUserForRemoveAccess(
    requester: UserDto,
    userId: string,
  ) {
    const user = await this.userService.findById(userId);

    if (user.role === UserRole.superAdmin) {
      throw new HttpException(
        'SuperAdmin can not be removed via URL.',
        HttpStatus.FORBIDDEN,
      );
    } else if (
      user.role === UserRole.admin &&
      requester.role === UserRole.admin
    ) {
      throw new HttpException(
        'User can be removed only by a higher role.',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private validateAdminRecruiterForCredentialsAccess(
    requester: UserDto,
    tenantId: string,
    userId: string,
  ): void {
    if (requester.role === UserRole.admin && requester.tenantId !== tenantId) {
      throw new ForbiddenException(
        'You can access users only within your own tenant.',
      );
    } else if (requester.role === UserRole.recruiter && requester.id !== userId)
      throw new HttpException(
        'Recruiter can change only their own fields.',
        HttpStatus.FORBIDDEN,
      );
  }

  private validateCandidateSuperAdminForCredentialsAccess(
    requester: UserDto,
    user: UserDto,
  ): void {
    if (
      (user.role === UserRole.candidate || user.role === UserRole.superAdmin) &&
      requester.id !== user.id
    )
      throw new HttpException(
        'Candidate and super admin can change only their own credentials.',
        HttpStatus.FORBIDDEN,
      );
  }
}
