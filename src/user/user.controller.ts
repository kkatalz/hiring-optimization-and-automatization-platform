import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthUser } from 'src/decorators/authUser.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/entities/role.enum';
import { TenantInterceptor } from 'src/interceptors/tenantId.interceptor';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { UpdateUserDto } from 'src/user/dto/updateUser.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { validateTenantAccess } from 'src/utils/validate';

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

  // @Roles(UserRole.superAdmin)
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

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Delete(':userId/tenant/:tenantId')
  remove(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
  ): Promise<UserDto> {
    validateTenantAccess(requester, tenantId);

    return this.userService.remove(userId, tenantId);
  }
}
