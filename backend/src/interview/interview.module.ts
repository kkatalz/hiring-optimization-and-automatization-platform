import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from '../entities/interview';
import { InterviewController } from '../interview/interview.controller';
import { InterviewService } from '../interview/interview.service';
import { VacancySubmissionModule } from '../vacancySubmission/vacancySubmission.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview]),
    VacancySubmissionModule,
    MailModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
