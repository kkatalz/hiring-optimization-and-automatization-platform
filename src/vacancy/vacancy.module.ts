import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancyController } from 'src/vacancy/vacancy.controller';
import { Vacancy } from 'src/entities/vacancy';
import { VacancyService } from 'src/vacancy/vacancy.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy])],
  controllers: [VacancyController],
  providers: [VacancyService],
  exports: [VacancyService],
})
export class VacancyModule {}
