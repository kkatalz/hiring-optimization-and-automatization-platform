import { useCreateVacancyMutation } from '../api/apiSlice';
import { getErrorMessage } from '../../utils/errorMessage';
import { type CreateVacancyInput } from './types';
import { useState } from 'react';

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
      await createVacancy(form as CreateVacancyInput).unwrap();
      alert('Vacancy created successfully!');
    } catch (error) {
      alert(
        `Failed to create vacancy: ${error} ` +
          getErrorMessage(createVacancyError),
      );
    }
  };

  return (
    <>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder='Name'
      />

      <input
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder='Description'
      />

      <input
        value={form.minSalary}
        onChange={(e) =>
          setForm({ ...form, minSalary: Number(e.target.value) })
        }
        placeholder='Min Salary'
        type='number'
      />

      <input
        value={form.maxSalary}
        onChange={(e) =>
          setForm({ ...form, maxSalary: Number(e.target.value) })
        }
        placeholder='Max Salary'
        type='number'
      />

      <input
        value={form.requiredYearsOfExperience}
        onChange={(e) =>
          setForm({
            ...form,
            requiredYearsOfExperience: Number(e.target.value),
          })
        }
        placeholder='Required Years of Experience'
        type='number'
      />

      <input
        value={form.tags?.join(', ')}
        onChange={(e) =>
          setForm({
            ...form,
            tags: e.target.value.split(',').map((tag) => tag.trim()),
          })
        }
        placeholder='Tags (comma separated)'
      />
      <br />
      <br />
      <button type='submit' onClick={handleCreate} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Vacancy'}
      </button>
    </>
  );
};
export default CreateVacancy;
