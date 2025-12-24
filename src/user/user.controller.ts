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
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/entities/role.enum';
import { TenantLogicInterceptor } from 'src/interceptors/tenantId.interceptor';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { UpdateUserDto } from 'src/user/dto/updateUser.dto';
import { UserResponseDto } from 'src/user/dto/userResponse.dto';
import { UserService } from 'src/user/user.service';

@Controller('users')
@UseInterceptors(TenantLogicInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('candidate')
  createCandidate(
    @Body() createCandidateDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(createCandidateDto, UserRole.candidate);
  }

  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('recruiter')
  createRecruiter(
    @Body() createRecruiterDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(createRecruiterDto, UserRole.recruiter);
  }

  @Roles(UserRole.superAdmin)
  @Post('admin')
  createAdmin(@Body() createAdminDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createAdminDto, UserRole.admin);
  }

  @Roles(UserRole.superAdmin)
  @Post('superAdmin')
  createSuperAdmin(
    @Body() createSuperAdminDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(createSuperAdminDto, UserRole.superAdmin);
  }

  // TODO
  // @Roles(UserRole.superAdmin)
  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  // @Roles(UserRole.superAdmin, UserRole.admin) //admin only for users within his tenant
  @Get('tenant/:id')
  findAllByTenantId(
    @Param('id', new ParseUUIDPipe()) tenantId: string,
  ): Promise<UserResponseDto[]> {
    return this.userService.findAllByTenantId(tenantId);
  }

  // @Roles(UserRole.superAdmin, UserRole.admin) //admin only for users within his tenant
  @Get(':id')
  findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findDtoById(id);
  }

  // @Roles(UserRole.superAdmin, UserRole.admin) //admin only for users within his tenant
  @Patch(':userId/tenant/:tenantId')
  update(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(userId, tenantId, updateUserDto);
  }

  // @Roles(UserRole.superAdmin, UserRole.admin) //admin only for users within his tenant
  @Delete(':userId/tenant/:tenantId')
  remove(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
  ): Promise<UserResponseDto> {
    return this.userService.remove(userId, tenantId);
  }
}
