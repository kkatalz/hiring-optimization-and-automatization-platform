import QuestionsList from '@/features/questions/components/QuestionsList';
import AddQuestionToVacancy from '@/features/vacancies/components/dialogs/AddQuestionToVacancy';
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

  const questionsCount = vacancyQuestions?.length ?? 0;

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
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0, sm: 1 }}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            textAlign: 'center',
            paddingBottom: { xs: 1, lg: 0 },
          }}
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

        <AddQuestionToVacancy vacancyId={vacancyId} />
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
