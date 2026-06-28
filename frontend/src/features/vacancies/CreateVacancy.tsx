import { useCreateVacancyMutation } from '../api/apiSlice';
import { getErrorMessage } from '../../utils/errorMessage';
import { type CreateVacancyInput } from './types';
import { useState } from 'react';
import VacancyForm from './VacancyForm';

const EMPTY_VACANCY_FORM: CreateVacancyInput = {
  name: '',
  description: '',
  minSalary: undefined,
  maxSalary: undefined,
  requiredYearsOfExperience: undefined,
  tags: [],
};

const CreateVacancy = () => {
  const [form, setForm] = useState<CreateVacancyInput>(EMPTY_VACANCY_FORM);

  const [createVacancy, { isLoading: isCreating, error: createVacancyError }] =
    useCreateVacancyMutation();

  const handleCreate = async () => {
    try {
      await createVacancy(form).unwrap();
      alert('Vacancy created successfully!');
    } catch (error) {
      alert(
        `Failed to create vacancy: ${error} ` +
          getErrorMessage(createVacancyError),
      );
    }
  };

  return (
      <div>
        <VacancyForm value={form} onChange={(next) => setForm(next)} />
        <button type='submit' onClick={handleCreate} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Vacancy'}
        </button>
      </div>
  );
};
export default CreateVacancy;
