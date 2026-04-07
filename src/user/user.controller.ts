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
import { ChangeRoleDto } from './dto/changeRole.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { validateTenantAccess } from '../utils/validate';
import { ChangeEmailDto } from './dto/changeEmail.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Recruiter can be added by admin when admin's tenant is the same as recruiter's tenant.
   *  SuperAdmin can add admin and recruiter without tenant restriction.
   */
  @UseInterceptors(TenantInterceptor)
  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('recruiter')
  async createRecruiter(
    @Body() createRecruiterDto: CreateUserDto,
  ): Promise<UserDto> {
    return await this.userService.create(
      createRecruiterDto,
      UserRole.recruiter,
    );
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

  @Roles(
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.recruiter,
    UserRole.candidate,
  )
  @Get(':id')
  async findById(
    @AuthUser() requester: UserDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserDto> {
    if (
      (requester.role === UserRole.candidate ||
        requester.role === UserRole.recruiter) &&
      requester.id !== id
    ) {
      throw new ForbiddenException('You can only view your own profile.');
    }

    if (requester.id !== id) {
      const userTenantId = await this.userService.getTenantIdByUserId(id);
      validateTenantAccess(requester, userTenantId);
    }

    return this.userService.findDtoById(id);
  }

  /**
   * SuperAdmin can update all users without tenant restriction.
   * Admin can update only users within their tenant, but not other tenants.
   * Recruiter can update only their own name fields.
   */
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

  /**
   * SuperAdmin can change any user's role.
   * Admin can change roles only within their tenant, but cannot promote to superAdmin and change admin's role.
   */
  @Roles(UserRole.superAdmin, UserRole.admin)
  @Patch(':userId/role')
  async changeRole(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() changeRoleDto: ChangeRoleDto,
  ): Promise<UserDto> {
    const user = await this.userService.findById(userId);

    if (requester.role === UserRole.admin) {
      if (!user.tenantId || user.tenantId !== requester.tenantId) {
        throw new ForbiddenException(
          'Admin can only change roles for users within their own tenant.',
        );
      }
      if (changeRoleDto.role === UserRole.superAdmin) {
        throw new ForbiddenException(
          'Admin cannot promote users to superAdmin.',
        );
      }
      if (user.role === UserRole.admin) {
        throw new ForbiddenException(
          "Admin cannot change another admin's role.",
        );
      }
    }

    return this.userService.changeRole(userId, changeRoleDto.role);
  }

  /**
   * SuperAdmin can change email and password for all users without tenant restriction.
   * Admin can change email and password only for users within their tenant, but not other tenants.
   * Recruiter can change email and password only for themselves.
   * Candidate can change email and password only for themselves.
   */
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

  /**
   * SuperAdmin can change email and password for all users without tenant restriction.
   * Admin can change email and password only for users within their tenant, but not other tenants.
   * Recruiter can change email and password only for themselves.
   * Candidate can change email and password only for themselves.
   */
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

    const isSelfChange = requester.id === userId;
    return await this.userService.changePassword(
      userId,
      changePasswordDto,
      isSelfChange,
    );
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
    if (requester.role === UserRole.superAdmin) return;

    if (requester.role === UserRole.candidate) {
      throw new ForbiddenException('You can change only your own credentials.');
    }

    if (requester.role === UserRole.admin && requester.tenantId !== tenantId) {
      throw new ForbiddenException(
        `You can access users only within your own tenant: ${requester.tenantId}, but not requested: ${tenantId}.`,
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
    if (requester.role === UserRole.superAdmin) return;

    if (requester.id !== user.id)
      throw new HttpException(
        'You can change only your own credentials.',
        HttpStatus.FORBIDDEN,
      );
  }
}
