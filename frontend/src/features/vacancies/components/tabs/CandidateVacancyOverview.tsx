import { Skeleton, Stack } from '@mui/material';
import MyApplicationCard from '@/features/vacancySubmissions/components/candidate/MyApplicationCard';
import { useMyVacancySubmission } from '@/features/vacancySubmissions/model/useMyVacancySubmission';
import { useVacancyOutletContext } from '../../model/useVacancyOutletContext';
import VacancyDescription from './VacancyDescription';

/**
 * The overview a CANDIDATE gets on the public vacancy page.
 *
 * The application blocks stay hidden for signed-out visitors and for staff, who
 * have no application here. The questions preview is public, so everyone sees it.
 */
const CandidateVacancyOverview = () => {
  const { vacancy } = useVacancyOutletContext();
  const { submission, isLoading } = useMyVacancySubmission(vacancy.id);

  return (
    <Stack
      direction='column'
      spacing={2}
      sx={{ width: '100%', maxWidth: 860, mt: 2 }}
    >
      <VacancyDescription description={vacancy.description} />

      {isLoading && <Skeleton variant='rounded' height={240} />}

      {submission && (
        <>
          <MyApplicationCard submission={submission} />
        </>
      )}
    </Stack>
  );
};

export default CandidateVacancyOverview;
