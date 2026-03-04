import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancySubmissionController } from '../vacancySubmission/vacancySubmission.controller';
import { VacancySubmissionService } from './vacancySubmission.service';
import { UserModule } from '../user/user.module';
import { CandidateProfileModule } from '../candidateProfile/candidateProfile.module';
import { QuestionModule } from '../question/question.module';
import { SubmissionAnswer } from '../entities/submissionAnswers';
import { Vacancy } from '../entities/vacancy';
import { VacancyModule } from '../vacancy/vacancy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VacancySubmission, SubmissionAnswer, Vacancy]),
    forwardRef(() => VacancyModule),
    UserModule,
    CandidateProfileModule,
    QuestionModule,
  ],
  controllers: [VacancySubmissionController],
  providers: [VacancySubmissionService],
  exports: [VacancySubmissionService],
})
export class VacancySubmissionModule {}
