import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancyModule } from '../vacancy/vacancy.module';
import { VacancySubmissionController } from '../vacancySubmission/vacancySubmission.controller';
import { VacancySubmissionService } from './vacancySubmission.service';

@Module({
  imports: [TypeOrmModule.forFeature([VacancySubmission]), VacancyModule],
  controllers: [VacancySubmissionController],
  providers: [VacancySubmissionService],
  exports: [VacancySubmissionService],
})
export class VacancySubmissionModule {}
