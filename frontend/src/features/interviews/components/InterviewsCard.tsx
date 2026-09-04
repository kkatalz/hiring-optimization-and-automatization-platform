import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useGetInterviewsBySubmissionIdQuery } from '@/features/interviews/api/interviewEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import InterviewRow from './InterviewRow';

interface InterviewsCardProps {
  submissionId: string;
}

const InterviewsCard = ({ submissionId }: InterviewsCardProps) => {
  const {
    data: interviews,
    isLoading,
    error,
  } = useGetInterviewsBySubmissionIdQuery(submissionId);

  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant='h6'>Interviews</Typography>

        {isLoading && <CircularProgress aria-label='Loading interviews…' />}

        {error && (
          <Alert severity='error'>
            Could not load interviews - {getErrorMessage(error)}
          </Alert>
        )}

        {interviews?.length === 0 && (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            No interviews scheduled yet.
          </Typography>
        )}

        <Stack spacing={2}>
          {interviews?.map((interview) => (
            <InterviewRow key={interview.id} interview={interview} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default InterviewsCard;
