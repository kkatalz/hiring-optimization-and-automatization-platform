import { useDeleteVacancyMutation } from '../../features/api/vacancyApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Button } from '@mui/material';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

type DeleteVacancyButtonProps = {
  vacancyId: string;
  onNotify: (message: string, severity: 'success' | 'error') => void;
};

const DeleteVacancyButton = ({
  vacancyId,
  onNotify,
}: DeleteVacancyButtonProps) => {
  const [deleteVacancy, { isLoading }] = useDeleteVacancyMutation();

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      await deleteVacancy(vacancyId).unwrap();
      onNotify('Vacancy deleted successfully!', 'success');
    } catch (error) {
      const message = getErrorMessage(
        error as FetchBaseQueryError | SerializedError,
      );
      onNotify(`Failed to delete vacancy: ${message}`, 'error');
    }
  };

  return (
    <Button
      variant='outlined'
      onClick={handleDelete}
      disabled={isLoading}
      color='error'
    >
      {isLoading ? 'Deleting...' : 'Delete'}
    </Button>
  );
};

export default DeleteVacancyButton;
