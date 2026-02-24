import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vacancy } from '../entities/vacancy';
import { VacancyQuestion } from '../entities/vacancyQuestion';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { CreateVacancyDto } from '../vacancy/dto/createVacancy.dto';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { UserDto } from '../user/dto/user.dto';
import { UserRole } from '../entities/role.enum';
import { vacancyToVacancyDto } from '../vacancy/map/vacancy.map';
import { VacancyQuestionDto } from '../vacancy/dto/vacancyQuestion.dto';
import { vacancyQuestionToDto } from '../vacancy/map/vacancyQuestion.map';
import { UserService } from '../user/user.service';
import { QuestionService } from '../question/question.service';
import { CreateVacancyQuestionDto } from './dto/createVacancyQuesion.dto';
import { VacancyQuestionDetailedDto } from './dto/vacancyQuestionDetailed.dto';
import { vacancyQuestionToDetailedDto } from './map/vacancyQuestionDetailed.map';
import { CreateVacancyQuestionInlineDto } from './dto/createVacancyWithQuestions.dto';

@Injectable()
export class VacancyService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    @InjectRepository(VacancyQuestion)
    private readonly vacancyQuestionRepository: Repository<VacancyQuestion>,

    private readonly userService: UserService,
    private readonly questionService: QuestionService,
  ) {}

  async findAll(): Promise<VacancyDto[]> {
    const vacancies = await this.vacancyRepository.find({
      relations: ['vacancyQuestions'],
    });

    return vacancies.map(vacancyToVacancyDto);
  }

  async findVacanciesWithSubmissions(
    requesterId: string,
  ): Promise<VacancyDto[]> {
    const requester = await this.userService.findById(requesterId);

    const vacancyQuery = this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoinAndSelect('vacancy.submissions', 'submission')
      .leftJoinAndSelect('vacancy.vacancyQuestions', 'vq');

    if (requester.role !== UserRole.superAdmin) {
      if (
        requester.role === UserRole.admin ||
        requester.role === UserRole.recruiter
      ) {
        vacancyQuery.andWhere('vacancy.tenantId = :tenantId', {
          tenantId: requester.tenantId,
        });
      } else if (requester.role === UserRole.candidate) {
        throw new HttpException(
          'Candidates are not allowed to see if vacancies have submissions.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const vacancies = await vacancyQuery.getMany();
    return vacancies.map(vacancyToVacancyDto);
  }

  async findVacancyById(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
      relations: ['vacancyQuestions'],
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancyToVacancyDto(vacancy);
  }

  async findAllByTenantId(tenantId: string): Promise<VacancyDto[]> {
    const vacanciesWithGivenTenant = await this.vacancyRepository.find({
      where: { tenantId },
      relations: ['vacancyQuestions'],
    });

    if (!vacanciesWithGivenTenant?.length) {
      throw new HttpException(
        'No vacancies within provided tenant were found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return vacanciesWithGivenTenant.map(vacancyToVacancyDto);
  }

  async create(
    createVacancyDto: CreateVacancyDto,
    creator: UserDto,
  ): Promise<VacancyDto> {
    const { questions, ...vacancyFields } = createVacancyDto;

    const savedVacancy = await this.saveBaseVacancy(vacancyFields, creator);

    if (questions?.length) {
      await this.handleVacancyQuestions(
        savedVacancy.id,
        savedVacancy.tenantId,
        questions,
      );
    }

    return this.getPopulatedVacancy(savedVacancy.id);
  }

  async update(
    vacancyId: string,
    updateVacancyDto: UpdateVacancyDto,
  ): Promise<VacancyDto> {
    const { questions, ...updatedFields } = updateVacancyDto;

    const vacancy: VacancyDto = await this.findVacancyById(vacancyId);

    Object.assign(vacancy, updatedFields);
    await this.vacancyRepository.save(vacancy);

    if (questions?.length) {
      await this.handleVacancyQuestions(
        vacancy.id,
        vacancy.tenantId,
        questions,
      );
    }

    return this.getPopulatedVacancy(vacancyId);
  }

  async remove(vacancyId: string): Promise<VacancyDto> {
    const vacancy = await this.findVacancyById(vacancyId);

    await this.vacancyRepository.delete(vacancyId);
    return vacancy;
  }

  async getTenantIdByVacancyId(vacancyId: string): Promise<string> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id: vacancyId },
      select: ['tenantId'],
    });

    if (!vacancy) {
      throw new HttpException('Vacancy is not found.', HttpStatus.NOT_FOUND);
    }

    return vacancy.tenantId;
  }

  //  METHODS RELATED TO MANAGING VACANCY QUESTIONS
  async addQuestionToVacancy(
    vacancyId: string,
    questionId: string,
    body: CreateVacancyQuestionDto,
  ): Promise<VacancyQuestionDto> {
    await this.findVacancyById(vacancyId);
    await this.questionService.findDtoById(questionId);

    const existing = await this.vacancyQuestionRepository.findOne({
      where: { vacancyId, questionId },
    });

    if (existing) {
      throw new HttpException(
        'Question is already linked to this vacancy.',
        HttpStatus.CONFLICT,
      );
    }

    const vacancyQuestion = this.vacancyQuestionRepository.create({
      vacancyId,
      questionId,
      isRequired: body.isRequired,
    });

    const saved = await this.vacancyQuestionRepository.save(vacancyQuestion);
    return vacancyQuestionToDto(saved);
  }

  async removeQuestionFromVacancy(
    vacancyId: string,
    questionId: string,
  ): Promise<VacancyQuestionDto> {
    await this.findVacancyById(vacancyId);
    await this.questionService.findDtoById(questionId);

    const existing = await this.vacancyQuestionRepository.findOne({
      where: { vacancyId, questionId },
    });

    if (!existing) {
      throw new HttpException(
        'Question is not linked to this vacancy.',
        HttpStatus.NOT_FOUND,
      );
    }

    const dto = vacancyQuestionToDto(existing);
    await this.vacancyQuestionRepository.remove(existing);

    return dto;
  }

  async findAllQuestionsByVacancyId(
    vacancyId: string,
  ): Promise<VacancyQuestionDetailedDto[]> {
    const vacancyQuestions: VacancyQuestion[] =
      await this.vacancyQuestionRepository
        .createQueryBuilder('vq')
        .innerJoinAndSelect('vq.question', 'question')
        .where('vq.vacancyId = :vacancyId', { vacancyId })
        .getMany();

    return vacancyQuestions.map(vacancyQuestionToDetailedDto);
  }

  async findAllVacanciesThatHaveQuestions(
    tenantId?: string,
  ): Promise<VacancyDto[]> {
    const vacancies = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoinAndSelect('vacancy.vacancyQuestions', 'vq')
      .where(tenantId ? 'vacancy.tenantId = :tenantId' : '1=1')
      .setParameter('tenantId', tenantId)
      .getMany();

    return vacancies.map(vacancyToVacancyDto);
  }

  private async saveBaseVacancy(
    fields: Partial<CreateVacancyDto>,
    creator: UserDto,
  ): Promise<Vacancy> {
    const vacancy = this.vacancyRepository.create({
      ...fields,
      tenantId: creator.tenantId,
      createdById: creator.id,
      createdBy: creator,
    });

    return this.vacancyRepository.save(vacancy);
  }

  /**
   * Creates questions via QuestionService and links them to the Vacancy
   */
  private async handleVacancyQuestions(
    vacancyId: string,
    tenantId: string,
    questions: CreateVacancyQuestionInlineDto[],
  ): Promise<void> {
    const linkPromises = questions.map(async (q) => {
      const savedQuestion = await this.questionService.create(
        { label: q.label, type: q.type, answerOptions: q.answerOptions },
        tenantId,
      );

      return this.vacancyQuestionRepository.create({
        vacancyId,
        questionId: savedQuestion.id,
        isRequired: q.isRequired,
      });
    });

    const vacancyQuestions = await Promise.all(linkPromises);

    await this.vacancyQuestionRepository.save(vacancyQuestions);
  }

  private async getPopulatedVacancy(id: string): Promise<VacancyDto> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { id },
      relations: ['vacancyQuestions', 'vacancyQuestions.question'],
    });

    if (!vacancy) {
      throw new HttpException(
        'Vacancy not found after creation/update.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return vacancyToVacancyDto(vacancy);
  }
}
