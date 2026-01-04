import { ConfigModule } from '@nestjs/config';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from 'mocha';
import { VacancySubmission } from 'src/entities/vacancySubmission';
import { VacancySubmissionService } from 'src/vacancySubmission/vacancySubmission.service';
import { testDatabaseConfig } from 'test/database-setup';
import { Repository } from 'typeorm';

describe('VacancySubmissionService', () => {
  let service: VacancySubmissionService;
  let VacancySubmissionRepository: Repository<VacancySubmission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([VacancySubmission]),
      ],
      providers: [VacancyService],
    }).compile();

    service = module.get<VacancyService>(VacancyService);
    vacancyRepository = module.get<Repository<Vacancy>>(
      getRepositoryToken(Vacancy),
    );

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
      Vacancy: testVacancies,
      VacancySubmission: testVacancySubmissions,
    });
  });

  afterEach(async () => await cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });
});
