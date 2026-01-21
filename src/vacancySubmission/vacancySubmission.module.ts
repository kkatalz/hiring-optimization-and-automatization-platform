import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancyModule } from '../vacancy/vacancy.module';
import { VacancySubmissionController } from '../vacancySubmission/vacancySubmission.controller';
import { VacancySubmissionService } from './vacancySubmission.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VacancySubmission]),
    VacancyModule,
    UserModule,
  ],
  controllers: [VacancySubmissionController],
  providers: [VacancySubmissionService],
  exports: [VacancySubmissionService],
})
export class VacancySubmissionModule {}
