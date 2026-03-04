import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { Vacancy } from '../entities/vacancy';
import { ClusteringController } from './clustering.controller';
import { ClusteringService } from './clustering.service';
import { VacancyModule } from '../vacancy/vacancy.module';
import { VacancySubmissionModule } from '../vacancySubmission/vacancySubmission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VacancySubmission, Vacancy]),
    VacancySubmissionModule,
    forwardRef(() => VacancyModule),
  ],
  controllers: [ClusteringController],
  providers: [ClusteringService],
  exports: [ClusteringService],
})
export class ClusteringModule {}
