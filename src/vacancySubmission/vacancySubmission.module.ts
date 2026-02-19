import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancyModule } from '../vacancy/vacancy.module';
import { VacancySubmissionController } from '../vacancySubmission/vacancySubmission.controller';
import { VacancySubmissionService } from './vacancySubmission.service';
import { UserModule } from '../user/user.module';
import { CandidateProfileModule } from '../candidateProfile/candidateProfile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VacancySubmission]),
    VacancyModule,
    UserModule,
    CandidateProfileModule,
  ],
  controllers: [VacancySubmissionController],
  providers: [VacancySubmissionService],
  exports: [VacancySubmissionService],
})
export class VacancySubmissionModule {}
