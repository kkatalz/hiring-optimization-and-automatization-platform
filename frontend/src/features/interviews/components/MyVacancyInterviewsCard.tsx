import {
  Alert,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useGetMyInterviewsQuery } from '@/features/interviews/api/interviewEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import InterviewRow from './InterviewRow';

interface MyVacancyInterviewsCardProps {
  submissionId: string;
}

/** The candidate's interviews for one application. */
const MyVacancyInterviewsCard = ({
  submissionId,
}: MyVacancyInterviewsCardProps) => {
  const { data: interviews, isLoading, error } = useGetMyInterviewsQuery();

  const interviewsForApplication = interviews?.filter(
    (interview) => interview.submissionId === submissionId,
  );

  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant='h6'>Your interviews</Typography>

        {isLoading && <Skeleton variant='rounded' height={64} />}

        {error && (
          <Alert severity='error'>
            Could not load your interviews - {getErrorMessage(error)}
          </Alert>
        )}

        {interviewsForApplication?.length === 0 && (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Nothing scheduled yet. You will see the date and the meeting link
            here as soon as the recruiter books one.
          </Typography>
        )}

        <Stack spacing={2}>
          {interviewsForApplication?.map((interview) => (
            <InterviewRow key={interview.id} interview={interview} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MyVacancyInterviewsCard;
