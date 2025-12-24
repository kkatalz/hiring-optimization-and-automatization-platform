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
import { TenantLogicInterceptor } from 'src/interceptors/tenantId.interceptor';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { UpdateUserDto } from 'src/user/dto/updateUser.dto';
import { UserResponseDto } from 'src/user/dto/userResponse.dto';
import { UserService } from 'src/user/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('candidate')
  createCandidate(
    @Body() createCandidateDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(createCandidateDto, UserRole.candidate);
  }

  @UseInterceptors(TenantLogicInterceptor)
  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('recruiter')
  createRecruiter(
    @Body() createRecruiterDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(createRecruiterDto, UserRole.recruiter);
  }

  @UseInterceptors(TenantLogicInterceptor)
  @Roles(UserRole.superAdmin)
  @Post('admin')
  createAdmin(@Body() createAdminDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createAdminDto, UserRole.admin);
  }

  @UseInterceptors(TenantLogicInterceptor)
  @Roles(UserRole.superAdmin)
  @Post('superAdmin')
  createSuperAdmin(
    @Body() createSuperAdminDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(createSuperAdminDto, UserRole.superAdmin);
  }

  @Roles(UserRole.superAdmin)
  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Get('tenant/:id')
  findAllByTenantId(
    @AuthUser() requester: UserResponseDto,
    @Param('id', new ParseUUIDPipe()) tenantId: string,
  ): Promise<UserResponseDto[]> {
    return this.userService.findAllByTenantId(tenantId, requester);
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Get(':id')
  findById(
    @AuthUser() requester: UserResponseDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findDtoById(id, requester);
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Patch(':userId/tenant/:tenantId')
  update(
    @AuthUser() requester: UserResponseDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(userId, tenantId, updateUserDto, requester);
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @Delete(':userId/tenant/:tenantId')
  remove(
    @AuthUser() requester: UserResponseDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
  ): Promise<UserResponseDto> {
    return this.userService.remove(userId, tenantId, requester);
  }
}
