import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';
import { validateTenantAccess } from '../utils/validate';
import { CreateQuestionDto } from './dto/createQuestion.dto';
import { UpdateQuestionDto } from './dto/updateQuestion.dto';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * 1. Super admin can create questions for any tenant. They must provide a tenantId.
   * 2. Admin and recruiter can only create questions for their own tenant. If they provide a tenantId, it must match their own tenantId.
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Post()
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @AuthUser() user: UserDto,
    @Query('tenantId') tenantId?: string,
  ) {
    tenantId = this.getTenantIdForCreate(user, tenantId);

    validateTenantAccess(user, tenantId);

    return await this.questionService.create(createQuestionDto, tenantId);
  }

  /**
   * 1. Super admin can view all questions across all tenants.
   * 2. Super admin can view questions within specified tenant
   * 3. Admin and recruiter can only view questions within their own tenant, even if they provide a tenantId query parameter.
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get()
  async findAllQuestions(
    @AuthUser() user: UserDto,
    @Query('tenantId') tenantId?: string,
  ) {
    tenantId = tenantId ?? user.tenantId;

    if (tenantId) validateTenantAccess(user, tenantId);

    return await this.questionService.findAll(tenantId);
  }

  /**
   *  Super admin can view any question by ID.
   * Admin and recruiter can only view a question within their own tenant.
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Get(':id')
  async findQuestionById(@Param('id') id: string, @AuthUser() user: UserDto) {
    const question = await this.questionService.findDtoById(id);

    validateTenantAccess(user, question.tenantId);

    return question;
  }

  /**
   * 1. Super admin can update any question by ID.
   * 2. Admin and recruiter can only update a question within their own tenant.
   */
  @Patch(':id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @AuthUser() user: UserDto,
  ) {
    const question = await this.questionService.findDtoById(id);

    validateTenantAccess(user, question.tenantId);

    return this.questionService.update(id, updateQuestionDto);
  }

  /**
   * 1. Super admin can delete any question by ID.
   * 2. Admin and recruiter can only delete a question within their own tenant.
   */
  @Delete(':id')
  async removeQuestion(@Param('id') id: string, @AuthUser() user: UserDto) {
    const question = await this.questionService.findDtoById(id);

    validateTenantAccess(user, question.tenantId);

    return this.questionService.remove(id);
  }

  private getTenantIdForCreate(
    user: UserDto,
    tenantId: string | undefined,
  ): string {
    if (user.role === UserRole.superAdmin && !tenantId) {
      throw new HttpException(
        'Tenant ID is required for super admin.',
        HttpStatus.BAD_REQUEST,
      );
    }

    tenantId = tenantId ?? user.tenantId;

    if (!tenantId) {
      throw new HttpException(
        'Tenant ID is required to create a question.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return tenantId;
  }
}
