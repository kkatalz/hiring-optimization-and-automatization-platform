import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancyController } from '../vacancy/vacancy.controller';
import { Vacancy } from '../entities/vacancy';
import { VacancyQuestion } from '../entities/vacancyQuestion';
import { VacancyService } from '../vacancy/vacancy.service';
import { UserModule } from '../user/user.module';
import { QuestionModule } from '../question/question.module';
import { VacancySubmissionModule } from '../vacancySubmission/vacancySubmission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vacancy, VacancyQuestion]),
    UserModule,
    QuestionModule,
    forwardRef(() => VacancySubmissionModule),
  ],
  controllers: [VacancyController],
  providers: [VacancyService],
  exports: [VacancyService],
})
export class VacancyModule {}
