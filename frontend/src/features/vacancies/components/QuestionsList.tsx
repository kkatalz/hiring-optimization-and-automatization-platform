import { useState } from 'react';
import type { Notification, VacancyQuestionDetailed } from '@/types';
import { Alert, List } from '@mui/material';
import NotificationAlert from '@/shared/ui/NotificationAlert';
import QuestionCard from '@/features/vacancies/components/QuestionCard';

interface QuestionsListProps {
  vacancyQuestions: VacancyQuestionDetailed[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const QuestionsList = ({
  vacancyQuestions,
  isLoading,
  isError,
}: QuestionsListProps) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (isError)
    return (
      <Alert severity='error'>
        Could not load questions. Try refreshing the page or contact support if
        the problem persists.
      </Alert>
    );

  return (
    <List
      sx={{
        width: '100%',
        minWidth: '330px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <NotificationAlert
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {vacancyQuestions?.map((questionInfo) => (
        <QuestionCard
          key={questionInfo.questionId}
          questionInfo={questionInfo}
          onNotify={(message, severity) =>
            setNotification({ message, severity })
          }
        />
      ))}
    </List>
  );
};

export default QuestionsList;
