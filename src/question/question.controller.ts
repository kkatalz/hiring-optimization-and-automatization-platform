import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { extractUserTenantId } from '../utils/extractUserTenantId';

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
    tenantId = extractUserTenantId(user, tenantId);

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
  async findQuestionById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthUser() user: UserDto,
  ) {
    const question = await this.questionService.findDtoById(id);

    validateTenantAccess(user, question.tenantId);

    return question;
  }

  /**
   * 1. Super admin can update any question by ID.
   * 2. Admin and recruiter can only update a question within their own tenant.
   */
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Patch(':id')
  async updateQuestion(
    @Param('id', new ParseUUIDPipe()) id: string,
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
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.recruiter)
  @Delete(':id')
  async removeQuestion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthUser() user: UserDto,
  ) {
    const question = await this.questionService.findDtoById(id);

    validateTenantAccess(user, question.tenantId);

    return this.questionService.remove(id);
  }
}
