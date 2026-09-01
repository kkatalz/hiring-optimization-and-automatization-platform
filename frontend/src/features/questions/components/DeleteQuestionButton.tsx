import { useRemoveQuestionFromVacancyMutation } from '@/features/vacancies/api/vacancyEndpoints';
import DeleteEntityButton from '@/shared/ui/DeleteEntityButton';
import { useParams } from 'react-router-dom';

type DeleteQuestionButtonProps = {
  questionId: string;
  onNotify: (message: string, severity: 'success' | 'error') => void;
};

const DeleteQuestionButton = ({
  questionId,
  onNotify,
}: DeleteQuestionButtonProps) => {
  const vacancyId = useParams().vacancyId as string;

  const [removeQuestion, { isLoading }] =
    useRemoveQuestionFromVacancyMutation();

  return (
    <DeleteEntityButton
      entityLabel='question from vacancy'
      onDelete={() => removeQuestion({ vacancyId, questionId }).unwrap()}
      isLoading={isLoading}
      onNotify={onNotify}
      variant='icon'
      sx={{ color: 'grey.50' }}
    />
  );
};

export default DeleteQuestionButton;
