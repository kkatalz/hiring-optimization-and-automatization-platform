import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../entities/question';
import { TenantModule } from '../tenant/tenant.module';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question]), TenantModule],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
