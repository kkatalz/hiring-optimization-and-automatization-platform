import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancyModule } from '../vacancy/vacancy.module';
import { VacancySubmissionController } from '../vacancySubmission/vacancySubmission.controller';
import { VacancySumbissionService } from '../vacancySubmission/vacancySumbission.service';

@Module({
  imports: [TypeOrmModule.forFeature([VacancySubmission]), VacancyModule],
  controllers: [VacancySubmissionController],
  providers: [VacancySumbissionService],
  exports: [VacancySumbissionService],
})
export class VacancySumbissionModule {}
