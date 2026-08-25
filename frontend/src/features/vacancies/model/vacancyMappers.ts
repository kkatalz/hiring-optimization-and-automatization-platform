import type { UpdateVacancyInput, Vacancy } from '@/types';

/**
 * Picks the fields the update form can edit. Screening questions are left out
 * on purpose - UpdateVacancyForm fetches them separately.
 */
export const toUpdateVacancyInput = (vacancy: Vacancy): UpdateVacancyInput => ({
  name: vacancy.name,
  description: vacancy.description,
  minSalary: vacancy.minSalary,
  maxSalary: vacancy.maxSalary,
  timeCommitment: vacancy.timeCommitment,
  languageRequirements: vacancy.languageRequirements,
  requiredYearsOfExperience: vacancy.requiredYearsOfExperience,
  tags: vacancy.tags,
  customWeights: vacancy.customWeights,
});
