import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from 'src/entities/interview';
import { InterviewController } from 'src/interview/interview.controller';
import { InterviewService } from 'src/interview/interview.service';
import { VacancySubmissionModule } from 'src/vacancySubmission/vacancySubmission.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interview]), VacancySubmissionModule],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
