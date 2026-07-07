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
  timeCommitment: undefined,
  languageRequirements: [],
  requiredYearsOfExperience: undefined,
  tags: [],
  customWeights: {
    questions: 1,
    tags: 1,
    languages: 1,
    experience: 1,
    salary: 1,
  },
};

export const CreateVacancy = () => {
  const [open, setOpen] = useState(true);

  const [form, setForm] = useState<CreateVacancyInput>(EMPTY_VACANCY_FORM);

  const [createVacancy, { isLoading: isCreating, error: createVacancyError }] =
    useCreateVacancyMutation();

  const handleCreate = async () => {
    try {
      await createVacancy(form).unwrap();
      setOpen(false);
      alert('Vacancy created successfully!');
    } catch (error: any) {
      const backendError = error?.data?.error || 'Unknown Error';
      const backendMessage = error?.data?.message || 'No message provided';
      const alternativeMessage = getErrorMessage(createVacancyError);

      alert(
        `Failed to create vacancy: ${backendError} - ${backendMessage || alternativeMessage}`,
      );

      setOpen(false);
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
