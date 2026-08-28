import AddQuestionToVacancy from '@/features/questions/dialogs/AddQuestionToVacancy';
import { Stack, Typography } from '@mui/material';

const ScreeningQuestionsView = () => {
  return (
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
        <Typography variant='subtitle1'>4 questions</Typography>
        <Typography variant='subtitle1'>
          shown to candidates when they apply
        </Typography>
        <Typography variant='subtitle1'>
          answers are used in both the match score and the clustering
        </Typography>
      </Stack>

      <AddQuestionToVacancy />
    </Stack>
  );
};

export default ScreeningQuestionsView;
