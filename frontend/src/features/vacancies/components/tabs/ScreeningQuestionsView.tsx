import QuestionsList from '@/features/questions/components/QuestionsList';
import AddQuestionToVacancy from '@/features/questions/dialogs/AddQuestionToVacancy';
import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useFindAllQuestionsByVacancyIdQuery } from '@/features/vacancies/api/vacancyEndpoints';

const ScreeningQuestionsView = () => {
  const vacancyId = useParams().vacancyId as string;

  const {
    data: vacancyQuestions,
    isLoading,
    isError,
  } = useFindAllQuestionsByVacancyIdQuery(vacancyId);

  const questionsCount = vacancyQuestions?.length;

  return (
    <>
      <Stack
        direction='row'
        sx={{
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          divider={<span>·</span>}
          direction='row'
          spacing={1}
          sx={{ alignItems: 'center', color: 'text.secondary' }}
        >
          <Typography variant='subtitle1'>
            {questionsCount} questions
          </Typography>
          <Typography variant='subtitle1'>
            shown to candidates when they apply
          </Typography>
          <Typography variant='subtitle1'>
            answers are used in both the match score and the clustering
          </Typography>
        </Stack>

        <AddQuestionToVacancy />
      </Stack>

      <QuestionsList
        vacancyQuestions={vacancyQuestions}
        isLoading={isLoading}
        isError={isError}
      />
    </>
  );
};

export default ScreeningQuestionsView;
