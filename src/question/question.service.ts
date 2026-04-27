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
        'Question with the same label, type (and answer options for dropdowns) already exists within this tenant.',
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
        'Question with the same label, type (and answer options for dropdowns) already exists within this tenant.',
        HttpStatus.CONFLICT,
      );
    }

    this.questionRepository.merge(question, updateQuestionDto);

    if (newType === QuestionType.text || newType === QuestionType.boolean)
      question.answerOptions = [];

    const updatedQuestion = await this.questionRepository.save(question);

    return questionToQuestionDto(updatedQuestion);
  }

  async remove(question: Question): Promise<QuestionDto> {
    const dto = questionToQuestionDto(question);

    await this.questionRepository.remove(question);

    return dto;
  }

  /** Checks if a question with the same label, type, and (if dropdown) answer options already exists within the tenant.
   * Used to enforce the uniqueness constraint for questions.
   */
  async findExistingQuestion(
    question: CreateQuestionDto,
    tenantId: string,
  ): Promise<QuestionDto | null> {
    const matchingQuestions = await this.questionRepository.find({
      where: {
        tenantId,
        label: question.label,
        type: question.type,
      },
    });

    if (!matchingQuestions.length) return null;

    // If it's not a dropdown, the (tenantId, label, type) tuple is unique, so the first match is the duplicate.
    if (question.type !== QuestionType.dropdown)
      return questionToQuestionDto(matchingQuestions[0]);

    // For dropdowns, only the row whose answerOptions exactly match counts as a duplicate.
    const incomingOptions = JSON.stringify(question.answerOptions || []);
    const duplicate = matchingQuestions.find(
      (q) => JSON.stringify(q.answerOptions || []) === incomingOptions,
    );

    return duplicate ? questionToQuestionDto(duplicate) : null;
  }

  async findById(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new HttpException('Question not found.', HttpStatus.NOT_FOUND);
    }

    return question;
  }
}
