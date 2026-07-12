import { useState } from 'react';
import type { UpdateVacancyInput } from './types';
import { useUpdateVacancyMutation } from '../api/vacancyApi';
import { getErrorMessage } from '../../utils/errorMessage';
import styles from '../../utils/styles';
import VacancyForm from './VacancyForm';
import { CloseButton } from '../../utils/CloseButton';

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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div style={{ ...styles.overlay }} onClick={handleOverlayClick}>
          <div style={styles.modalWindow}>
            <CloseButton onClick={() => setIsOpen(false)} />
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
