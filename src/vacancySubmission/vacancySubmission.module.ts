import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancyModule } from '../vacancy/vacancy.module';
import { VacancySubmissionController } from '../vacancySubmission/vacancySubmission.controller';
import { VacancySubmissionService } from './vacancySubmission.service';
import { UserModule } from '../user/user.module';
import { CandidateProfileModule } from '../candidateProfile/candidateProfile.module';
import { QuestionModule } from '../question/question.module';
import { SubmissionAnswer } from '../entities/submissionAnswers';

@Module({
  imports: [
    TypeOrmModule.forFeature([VacancySubmission, SubmissionAnswer]),
    VacancyModule,
    UserModule,
    CandidateProfileModule,
    QuestionModule,
  ],
  controllers: [VacancySubmissionController],
  providers: [VacancySubmissionService],
  exports: [VacancySubmissionService],
})
export class VacancySubmissionModule {}
