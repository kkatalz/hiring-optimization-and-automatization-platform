import { useState } from 'react';
import type { CreateVacancyInput } from './types';
import { useUpdateVacancyMutation } from '../api/apiSlice';
import { getErrorMessage } from '../../utils/errorMessage';
import styles from '../../utils/styles';
import VacancyForm from './VacancyForm';

const UpdateVacancyForm = ({
  vacancyId,
  initialData,
}: {
  vacancyId: string;
  initialData: CreateVacancyInput;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState<CreateVacancyInput>(initialData);

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
            <VacancyForm value={form} onChange={(form) => setForm(form)} />

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
