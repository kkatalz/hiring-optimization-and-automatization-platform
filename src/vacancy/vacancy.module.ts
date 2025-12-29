import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancyController } from '../vacancy/vacancy.controller';
import { Vacancy } from '../entities/vacancy';
import { VacancyService } from '../vacancy/vacancy.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy])],
  controllers: [VacancyController],
  providers: [VacancyService],
  exports: [VacancyService],
})
export class VacancyModule {}
