import { useState } from 'react';
import type { UpdateVacancyInput } from './types';
import { useUpdateVacancyMutation } from '../api/apiSlice';
import { getErrorMessage } from '../../utils/errorMessage';
import styles from '../../utils/styles';

const UpdateVacancyForm = ({
  vacancyId,
  initialData,
}: {
  vacancyId: string;
  initialData: UpdateVacancyInput;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState<UpdateVacancyInput>(initialData);

  const [updateVacancy, { isLoading: isUpdating, error: updateVacancyError }] =
    useUpdateVacancyMutation();

  const handleSubmit = async () => {
    try {
      await updateVacancy({ id: vacancyId, body: form }).unwrap();
      setIsOpen(false);
      alert('Vacancy updated successfully!');
    } catch (error) {
      alert(
        `Failed to update vacancy: ${error} ` +
          getErrorMessage(updateVacancyError),
      );
    }
  };

  return (
    <>
      {isOpen && (
        <div style={{ ...styles.overlay }}>
          <div style={styles.modalWindow}>
            <h2>Update Vacancy</h2>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder='Name'
            />

            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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

            <button type='submit' onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Vacancy'}
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(true)}>Update Vacancy</button>
    </>
  );
};

export default UpdateVacancyForm;
