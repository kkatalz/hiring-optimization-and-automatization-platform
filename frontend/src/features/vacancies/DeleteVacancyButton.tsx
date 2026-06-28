import { useDeleteVacancyMutation } from '../api/api';
import { getErrorMessage } from '../../utils/errorMessage';

const DeleteVacancyButton = ({ vacancyId }: { vacancyId: string }) => {
  const [deleteVacancy, { isLoading, error: deleteVacancyError }] =
    useDeleteVacancyMutation();

  const handleDelete = async () => {
    try {
      await deleteVacancy(vacancyId).unwrap();
      alert('Vacancy deleted successfully!');
    } catch (error) {
      alert(
        `Failed to delete vacancy: ${error} ` +
          getErrorMessage(deleteVacancyError),
      );
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete Vacancy'}
    </button>
  );
};

export default DeleteVacancyButton;
