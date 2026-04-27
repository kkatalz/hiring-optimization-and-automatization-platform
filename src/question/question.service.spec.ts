import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { expect } from 'chai';
import { Repository } from 'typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import {
  EXPECTED_QUESTIONS_NUM,
  EXPECTED_TENANT_0_QUESTIONS_NUM,
  testQuestions,
} from '../../test/fixtures/testQuestions';
import { testTenants } from '../../test/fixtures/testTenants';
import { nonExistentUUIDId } from '../../test/utils';
import { Question } from '../entities/question';
import { QuestionType } from '../entities/question.enum';
import { TenantModule } from '../tenant/tenant.module';
import { CreateQuestionDto } from './dto/createQuestion.dto';
import { UpdateQuestionDto } from './dto/updateQuestion.dto';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
  let service: QuestionService;
  let questionRepository: Repository<Question>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Question]),
        TenantModule,
      ],
      providers: [QuestionService],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    questionRepository = module.get<Repository<Question>>(
      getRepositoryToken(Question),
    );

    await loadDatabase({
      Tenant: testTenants,
      Question: testQuestions,
    });
  });

  afterEach(async () => await cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  describe('create', () => {
    it('should create a boolean question and return a QuestionDto', async () => {
      const tenantId = testTenants[0].id;
      const createDto: CreateQuestionDto = {
        label: 'Do you have a driver license?',
        type: QuestionType.boolean,
      };

      const result = await service.create(createDto, tenantId);

      expect(result.label).to.equal(createDto.label);
      expect(result.type).to.equal(QuestionType.boolean);
      expect(result.tenantId).to.equal(tenantId);
      expect(result.answerOptions).to.be.empty;

      const allQuestions = await service.findAll();
      expect(allQuestions.length).to.equal(EXPECTED_QUESTIONS_NUM + 1);
    });

    it('should create a dropdown question with answerOptions', async () => {
      const tenantId = testTenants[0].id;
      const createDto: CreateQuestionDto = {
        label: 'What is your seniority level?',
        type: QuestionType.dropdown,
        answerOptions: ['Junior', 'Mid', 'Senior'],
      };

      const result = await service.create(createDto, tenantId);

      expect(result.type).to.equal(QuestionType.dropdown);
      expect(result.answerOptions).to.deep.equal(['Junior', 'Mid', 'Senior']);
    });

    it('should throw a NOT_FOUND error when provided tenantId does not exist', async () => {
      const createDto: CreateQuestionDto = {
        label: 'Do you have a driver license?',
        type: QuestionType.boolean,
      };

      try {
        await service.create(createDto, nonExistentUUIDId);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 404);
        expect(e.response).to.equal('Tenant with given id not found.');
      }
    });

    it('should throw a CONFLICT error when trying to create a question with the same label and type in the same tenant', async () => {
      const tenantId = testTenants[0].id;
      const existing = testQuestions[0];

      const createDto: CreateQuestionDto = {
        label: existing.label,
        type: existing.type,
      };

      try {
        await service.create(createDto, tenantId);

        expect.fail('Should have thrown a CONFLICT error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 409);
        expect(e.response).to.equal(
          'Question with the same label and type already exists within this tenant.',
        );
      }
    });

    it('should throw a CONFLICT error when trying to create a dropdown question with the same label, type and answerOptions in the same tenant', async () => {
      const tenantId = testTenants[0].id;
      const existing = testQuestions[2];

      const createDto: CreateQuestionDto = {
        label: existing.label,
        type: existing.type,
        answerOptions: existing.answerOptions as string[],
      };

      try {
        await service.create(createDto, tenantId);

        expect.fail('Should have thrown a CONFLICT error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 409);
        expect(e.response).to.equal(
          'Question with the same label and type already exists within this tenant.',
        );
      }
    });

    it('should create a dropdown with the same label and type but different answerOptions in the same tenant', async () => {
      const tenantId = testTenants[0].id;
      const existing = testQuestions[2];

      const createDto: CreateQuestionDto = {
        label: existing.label,
        type: existing.type,
        answerOptions: ['Option A', 'Option B'],
      };

      const result = await service.create(createDto, tenantId);

      expect(result.label).to.equal(existing.label);
      expect(result.type).to.equal(QuestionType.dropdown);
      expect(result.answerOptions).to.deep.equal(['Option A', 'Option B']);

      const allQuestions = await service.findAll();
      expect(allQuestions.length).to.equal(EXPECTED_QUESTIONS_NUM + 1);
    });
  });

  describe('findAll', () => {
    it('should return all questions when no tenantId is provided', async () => {
      const result = await service.findAll();

      expect(result.length).to.equal(EXPECTED_QUESTIONS_NUM);
    });

    it('should return only questions belonging to the given tenant', async () => {
      const tenantId = testTenants[0].id;

      const result = await service.findAll(tenantId);

      expect(result.length).to.equal(EXPECTED_TENANT_0_QUESTIONS_NUM);
      result.forEach((q) => expect(q.tenantId).to.equal(tenantId));
    });

    it('should return an empty array when no questions match the given tenantId', async () => {
      const result = await service.findAll(testTenants[3].id);

      expect(result).to.deep.equal([]);
    });

    it('should return an empty array when tenantId does not exist', async () => {
      const result = await service.findAll(nonExistentUUIDId);

      expect(result).to.deep.equal([]);
    });
  });

  describe('findDtoById', () => {
    it('should return a QuestionDto including tenantId and answerOptions', async () => {
      const question = testQuestions[2]; // dropdown — verifies answerOptions survive mapping

      const result = await service.findDtoById(question.id);

      expect(result.id).to.equal(question.id);
      expect(result.tenantId).to.equal(question.tenantId);
      expect(result.label).to.equal(question.label);
      expect(result.type).to.equal(QuestionType.dropdown);
      expect(result.answerOptions).to.deep.equal(question.answerOptions);
    });

    it('should throw 404 when question is not found', async () => {
      try {
        await service.findDtoById(nonExistentUUIDId);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 404);
        expect(e.response).to.equal('Question not found.');
      }
    });
  });

  describe('update', () => {
    it('should update the label and leave other fields unchanged', async () => {
      const entity = await service.findById(testQuestions[1].id); // text question
      const updateDto: UpdateQuestionDto = {
        label: 'Describe your work experience in detail',
      };

      const result = await service.update(entity, updateDto);

      expect(result.id).to.equal(entity.id);
      expect(result.label).to.equal(updateDto.label);
      expect(result.type).to.equal(QuestionType.text);
      expect(result.tenantId).to.equal(entity.tenantId);
    });

    it('should clear answerOptions when type changes from dropdown to boolean', async () => {
      const entity = await service.findById(testQuestions[2].id); // dropdown
      const updateDto: UpdateQuestionDto = { type: QuestionType.boolean };

      const result = await service.update(entity, updateDto);

      expect(result.label).to.equal(entity.label);
      expect(result.type).to.equal(QuestionType.boolean);
      expect(result.answerOptions).to.be.empty;
    });

    it('should clear answerOptions when type changes from dropdown to text', async () => {
      const entity = await service.findById(testQuestions[2].id); // dropdown
      const updateDto: UpdateQuestionDto = { type: QuestionType.text };

      const result = await service.update(entity, updateDto);

      expect(result.label).to.equal(entity.label);
      expect(result.type).to.equal(QuestionType.text);
      expect(result.answerOptions).to.be.empty;
    });

    it('should preserve answerOptions when updating only the label of a dropdown question', async () => {
      const entity = await service.findById(testQuestions[2].id); // dropdown
      const originalOptions = entity.answerOptions;
      const updateDto: UpdateQuestionDto = {
        label: 'What is your highest qualification?',
      };

      const result = await service.update(entity, updateDto);

      expect(result.label).to.equal(updateDto.label);
      expect(result.answerOptions).to.deep.equal(originalOptions);
    });

    it('should promote a text question to dropdown with provided answerOptions', async () => {
      const entity = await service.findById(testQuestions[1].id); // text question
      const updateDto: UpdateQuestionDto = {
        type: QuestionType.dropdown,
        answerOptions: ['Yes', 'No', 'Maybe'],
      };

      const result = await service.update(entity, updateDto);

      expect(result.type).to.equal(QuestionType.dropdown);
      expect(result.answerOptions).to.deep.equal(['Yes', 'No', 'Maybe']);
      expect(result.label).to.equal(entity.label);
    });

    it('should throw a CONFLICT when updated label and type collide with another question in the same tenant', async () => {
      // testQuestions[1] is a text question in tenant[0];
      // testQuestions[0] is a boolean question in tenant[0].
      // Repointing [1] to (testQuestions[0].label, boolean) duplicates [0].
      const entity = await service.findById(testQuestions[1].id);
      const sibling = testQuestions[0];

      const updateDto: UpdateQuestionDto = {
        label: sibling.label,
        type: sibling.type,
      };

      try {
        await service.update(entity, updateDto);
        expect.fail('Should have thrown a CONFLICT error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 409);
        expect(e.response).to.equal(
          'Question with the same label and type already exists within this tenant.',
        );
      }
    });

    it('should allow update when matching label and type exist only in a different tenant', async () => {
      // testQuestions[3] is a boolean question in tenant[1].
      // Updating tenant[0]'s text question to that same (label, type) should succeed.
      const entity = await service.findById(testQuestions[1].id);
      const otherTenantQuestion = testQuestions[3];

      const updateDto: UpdateQuestionDto = {
        label: otherTenantQuestion.label,
        type: otherTenantQuestion.type,
      };

      const result = await service.update(entity, updateDto);

      expect(result.label).to.equal(otherTenantQuestion.label);
      expect(result.type).to.equal(otherTenantQuestion.type);
      expect(result.tenantId).to.equal(testTenants[0].id);
    });

    it('should not treat the question as its own duplicate (no-op update)', async () => {
      const entity = await service.findById(testQuestions[2].id); // dropdown
      const updateDto: UpdateQuestionDto = { label: entity.label };

      const result = await service.update(entity, updateDto);

      expect(result.id).to.equal(entity.id);
      expect(result.label).to.equal(entity.label);
    });

    it('should detect a CONFLICT when updated dropdown options match a sibling dropdown sharing the same label', async () => {
      // Two dropdowns can coexist with the same label/type if their options differ.
      // Updating one to share the other's options would make them true duplicates.
      const tenantId = testTenants[0].id;
      const sibling = await service.create(
        {
          label: testQuestions[2].label,
          type: QuestionType.dropdown,
          answerOptions: ['Option A', 'Option B'],
        },
        tenantId,
      );

      const entity = await service.findById(testQuestions[2].id);
      const updateDto: UpdateQuestionDto = {
        answerOptions: sibling.answerOptions,
      };

      try {
        await service.update(entity, updateDto);
        expect.fail('Should have thrown a CONFLICT error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 409);
        expect(e.response).to.equal(
          'Question with the same label and type already exists within this tenant.',
        );
      }
    });
  });

  describe('findExistingQuestion', () => {
    it('should find an existing boolean question by label and type within tenant', async () => {
      const existing = testQuestions[0]; // boolean "Do you have a car?" in tenant[0]

      const result = await service.findExistingQuestion(
        { label: existing.label, type: existing.type },
        testTenants[0].id,
      );

      expect(result).to.not.be.null;
      expect(result!.id).to.equal(existing.id);
      expect(result!.label).to.equal(existing.label);
      expect(result!.type).to.equal(existing.type);
    });

    it('should find an existing dropdown question matching label, type and answerOptions', async () => {
      const existing = testQuestions[2]; // dropdown "What is your education level?" in tenant[0]

      const result = await service.findExistingQuestion(
        {
          label: existing.label,
          type: existing.type,
          answerOptions: existing.answerOptions as string[],
        },
        testTenants[0].id,
      );

      expect(result).to.not.be.null;
      expect(result!.id).to.equal(existing.id);
      expect(result!.answerOptions).to.deep.equal(existing.answerOptions);
    });

    it('should return null when no matching question exists in the tenant', async () => {
      const result = await service.findExistingQuestion(
        {
          label: 'Non-existent question',
          type: QuestionType.boolean,
        },
        testTenants[0].id,
      );

      expect(result).to.be.null;
    });

    it('should return null when question exists in a different tenant', async () => {
      // testQuestions[3] is in tenant[1]
      const otherTenantQuestion = testQuestions[3];

      const result = await service.findExistingQuestion(
        {
          label: otherTenantQuestion.label,
          type: otherTenantQuestion.type,
        },
        testTenants[0].id, // searching in tenant[0]
      );

      expect(result).to.be.null;
    });

    it('should not match when label matches but type differs', async () => {
      const existing = testQuestions[0]; // boolean question

      const result = await service.findExistingQuestion(
        {
          label: existing.label,
          type: QuestionType.text, // different type
        },
        testTenants[0].id,
      );

      expect(result).to.be.null;
    });

    it('should not match dropdown question when answerOptions differ', async () => {
      const existing = testQuestions[2]; // dropdown with ['High School', 'Bachelor', 'Master', 'PhD']

      const result = await service.findExistingQuestion(
        {
          label: existing.label,
          type: existing.type,
          answerOptions: ['Option A', 'Option B'], // different options
        },
        testTenants[0].id,
      );

      expect(result).to.be.null;
    });
  });

  describe('remove', () => {
    it('should remove the question and return its QuestionDto', async () => {
      const fixture = testQuestions[0];
      const entity = await service.findById(fixture.id);

      const result = await service.remove(entity);

      expect(result.id).to.equal(fixture.id);
      expect(result.label).to.equal(fixture.label);
      expect(result.tenantId).to.equal(fixture.tenantId);

      const deletedInDb = await questionRepository.findOne({
        where: { id: fixture.id },
      });
      expect(deletedInDb).to.equal(null);

      const allQuestions = await service.findAll();
      expect(allQuestions.length).to.equal(EXPECTED_QUESTIONS_NUM - 1);
    });
  });

  describe('findById', () => {
    it('should throw 404 when question is not found', async () => {
      try {
        await service.findById(nonExistentUUIDId);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 404);
        expect(e.response).to.equal('Question not found.');
      }
    });
  });
});
