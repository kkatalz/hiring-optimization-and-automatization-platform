import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancySubmission } from 'src/entities/vacancySubmission';
import { VacancyModule } from 'src/vacancy/vacancy.module';
import { VacancySubmissionController } from 'src/vacancySubmission/vacancySubmission.controller';
import { VacancySumbissionService } from 'src/vacancySubmission/vacancySumbission.service';

@Module({
  imports: [TypeOrmModule.forFeature([VacancySubmission]), VacancyModule],
  controllers: [VacancySubmissionController],
  providers: [VacancySumbissionService],
  exports: [VacancySumbissionService],
})
export class VacancySumbissionModule {}
