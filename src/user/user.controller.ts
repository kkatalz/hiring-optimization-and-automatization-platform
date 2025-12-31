import {
  Body,
  Controller,
  Delete,
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
import { CreateUserDto } from '../user/dto/createUser.dto';
import { UpdateUserDto } from '../user/dto/updateUser.dto';
import { UserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { validateTenantAccess } from '../utils/validate';
import { ChangeCredentialsDto } from '../user/dto/changeCredentials.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('candidate')
  createCandidate(@Body() createCandidateDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createCandidateDto, UserRole.candidate);
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

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Patch(':userId/tenant/:tenantId')
  update(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    validateTenantAccess(requester, tenantId);

    return this.userService.update(userId, tenantId, updateUserDto);
  }

  @Roles(
    UserRole.candidate,
    UserRole.recruiter,
    UserRole.superAdmin,
    UserRole.admin,
  )
  @Patch('changeCredentials/:userId')
  async changeCredentials(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() changeCredentialsDto: ChangeCredentialsDto,
  ): Promise<UserDto> {
    if (!changeCredentialsDto.email && !changeCredentialsDto.password) {
      throw new HttpException(
        'No data provided to update. (Maybe you forgot Body?)',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.validateUserForChangingCredentials(requester, userId);

    return await this.userService.changeCredentials(
      userId,
      changeCredentialsDto,
    );
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Delete(':userId/tenant/:tenantId')
  async remove(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
  ): Promise<UserDto> {
    validateTenantAccess(requester, tenantId);
    await this.validateUserForRemoveAccess(requester, userId);

    return this.userService.remove(userId, tenantId);
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

  private async validateUserForChangingCredentials(
    requester: UserDto,
    userId: string,
  ) {
    await this.userService.findDtoById(userId, requester);

    if (
      (requester.role === UserRole.candidate ||
        requester.role === UserRole.recruiter) &&
      requester.id !== userId
    )
      throw new HttpException(
        'Candidate and recruiter can change only their own credentials.',
        HttpStatus.FORBIDDEN,
      );
  }
}
