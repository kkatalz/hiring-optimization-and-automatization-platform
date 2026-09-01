import { useRemoveQuestionFromVacancyMutation } from '@/features/vacancies/api/vacancyEndpoints';
import DeleteEntityButton from '@/shared/ui/DeleteEntityButton';

type DeleteQuestionButtonProps = {
  vacancyId: string;
  questionId: string;
  onNotify: (message: string, severity: 'success' | 'error') => void;
};

const DeleteQuestionButton = ({
  vacancyId,
  questionId,
  onNotify,
}: DeleteQuestionButtonProps) => {
  const [removeQuestion, { isLoading }] =
    useRemoveQuestionFromVacancyMutation();

  return (
    <DeleteEntityButton
      entityLabel='question'
      description='Remove this question from the vacancy? The question itself stays in your question library. '
      onDelete={() => removeQuestion({ vacancyId, questionId }).unwrap()}
      isLoading={isLoading}
      onNotify={onNotify}
      variant='icon'
      sx={{ color: 'text.disabled' }}
    />
  );
};

export default DeleteQuestionButton;
