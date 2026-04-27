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
    await this.tenantService.findDtoById(tenantId);

    const existingQuestion = await this.findExistingQuestion(
      createQuestionDto,
      tenantId,
    );

    if (existingQuestion) {
      throw new HttpException(
        'Question with the same label and type already exists within this tenant.',
        HttpStatus.CONFLICT,
      );
    }

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
    question: Question,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<QuestionDto> {
    const newType = updateQuestionDto.type ?? question.type;
    const newLabel = updateQuestionDto.label ?? question.label;
    const newAnswerOptions =
      updateQuestionDto.answerOptions ?? question.answerOptions;

    const existingQuestion = await this.findExistingQuestion(
      { label: newLabel, type: newType, answerOptions: newAnswerOptions },
      question.tenantId,
    );

    if (existingQuestion && existingQuestion.id !== question.id) {
      throw new HttpException(
        'Question with the same label and type already exists within this tenant.',
        HttpStatus.CONFLICT,
      );
    }

    this.questionRepository.merge(question, updateQuestionDto);

    if (newType === QuestionType.text || newType === QuestionType.boolean)
      question.answerOptions = [];

    const updatedQuestion = await this.questionRepository.save(question);

    return questionToQuestionDto(updatedQuestion);
  }

  async remove(id: string): Promise<QuestionDto> {
    const question = await this.findById(id);

    const dto = questionToQuestionDto(question);

    await this.questionRepository.remove(question);

    return dto;
  }

  async findExistingQuestion(
    question: CreateQuestionDto,
    tenantId: string,
  ): Promise<QuestionDto | null> {
    const foundQuestion = await this.questionRepository.findOne({
      where: {
        tenantId,
        label: question.label,
        type: question.type,
      },
    });

    if (!foundQuestion) return null;

    // If it's not a dropdown, we don't need to check answerOptions.
    if (question.type !== QuestionType.dropdown)
      return questionToQuestionDto(foundQuestion);

    // For dropdowns, handle potential undefined/null by defaulting to empty array
    const existingOptions = JSON.stringify(foundQuestion.answerOptions || []);
    const incomingOptions = JSON.stringify(question.answerOptions || []);

    if (existingOptions === incomingOptions)
      return questionToQuestionDto(foundQuestion);

    return null;
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
