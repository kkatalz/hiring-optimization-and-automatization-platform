import { Vacancy } from 'src/entities/vacancy';
import { VacancyDto } from 'src/vacancy/dto/vacancy.dto';

export const vacancyToVacancyDto = ({
  id,
  name,
  description,
  tags,
  salary,
}: Vacancy): VacancyDto => ({
  id,
  name,
  description,
  tags,
  salary,
});
