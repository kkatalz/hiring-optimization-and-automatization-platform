import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question';
import { CreateQuestionDto } from './dto/createQuestion.dto';
import { QuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/updateQuestion.dto';
import { questionToQuestionDto } from './map/question.map';
import { QuestionType } from '../entities/question.enum';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    private readonly tenantService: TenantService,
  ) {}

  async create(
    createQuestionDto: CreateQuestionDto,
    tenantId: string,
  ): Promise<QuestionDto> {
    if (tenantId) await this.tenantService.findDtoById(tenantId);

    const newQuestion = this.questionRepository.create({
      tenantId,
      ...createQuestionDto,
    });

    const savedQuestion = await this.questionRepository.save(newQuestion);

    return questionToQuestionDto(savedQuestion);
  }

  async findAll(tenantId?: string): Promise<QuestionDto[]> {
    if (tenantId) await this.tenantService.findDtoById(tenantId);

    const questions = await this.questionRepository.find({
      where: tenantId ? { tenantId } : {},
    });

    return questions.map(questionToQuestionDto);
  }

  async findDtoById(id: string): Promise<QuestionDto> {
    const question = await this.findById(id);

    return questionToQuestionDto(question);
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<QuestionDto> {
    const question = await this.findById(id);

    this.questionRepository.merge(question, updateQuestionDto);

    if (
      updateQuestionDto.type === QuestionType.text ||
      updateQuestionDto.type === QuestionType.boolean
    )
      question.answerOptions = null;

    const updatedQuestion = await this.questionRepository.save(question);

    return questionToQuestionDto(updatedQuestion);
  }

  async remove(id: string): Promise<QuestionDto> {
    const question = await this.findById(id);

    const dto = questionToQuestionDto(question);

    await this.questionRepository.remove(question);

    return dto;
  }

  async getQuestionDetailsById(id: string): Promise<QuestionDto> {
    const question = await this.findById(id);

    return questionToQuestionDto(question);
  }

  private async findById(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new HttpException('Question not found.', HttpStatus.NOT_FOUND);
    }

    return question;
  }
}
