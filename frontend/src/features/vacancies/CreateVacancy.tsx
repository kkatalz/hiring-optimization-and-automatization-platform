import { useCreateVacancyMutation } from '../api/api';
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
    <div
      style={{
        margin: '30px',
        padding: '20px',
        backgroundColor: '#d7eec8e3',
        borderRadius: '10px',
      }}
    >
      <VacancyForm value={form} onChange={(next) => setForm(next)} />
      <button
        type='submit'
        onClick={handleCreate}
        disabled={isCreating}
        style={{
          fontWeight: 'bolder',
          borderRadius: '5px',
          backgroundColor: '#abe783e3',
          border: '1px solid #abe783e3',
          padding: '3px 7px',
        }}
      >
        {isCreating ? 'Creating...' : 'Create Vacancy'}
      </button>
    </div>
  );
};
export default CreateVacancy;
