import { useDeleteVacancyMutation } from '@/features/vacancies/api/vacancyEndpoints';
import DeleteEntityButton from '@/shared/ui/DeleteEntityButton';

type DeleteVacancyButtonProps = {
  vacancyId: string;
  onNotify: (message: string, severity: 'success' | 'error') => void;
};

const DeleteVacancyButton = ({
  vacancyId,
  onNotify,
}: DeleteVacancyButtonProps) => {
  const [deleteVacancy, { isLoading }] = useDeleteVacancyMutation();

  return (
    <DeleteEntityButton
      entityLabel='vacancy'
      onDelete={() => deleteVacancy(vacancyId).unwrap()}
      isLoading={isLoading}
      onNotify={onNotify}
    />
  );
};

export default DeleteVacancyButton;
