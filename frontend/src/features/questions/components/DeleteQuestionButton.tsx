import { useRemoveQuestionMutation } from '@/features/questions/api/questionEndpoints';
import DeleteEntityButton from '@/shared/ui/DeleteEntityButton';

type DeleteQuestionButtonProps = {
  questionId: string;
  onNotify: (message: string, severity: 'success' | 'error') => void;
};

const DeleteQuestionButton = ({
  questionId,
  onNotify,
}: DeleteQuestionButtonProps) => {
  const [removeQuestion, { isLoading }] = useRemoveQuestionMutation();

  return (
    <DeleteEntityButton
      entityLabel='question'
      onDelete={() => removeQuestion({ id: questionId }).unwrap()}
      isLoading={isLoading}
      onNotify={onNotify}
      variant='icon'
      sx={{ color: 'grey.50' }}
    />
  );
};

export default DeleteQuestionButton;
