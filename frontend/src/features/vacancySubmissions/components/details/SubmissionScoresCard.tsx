import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useGetMatchScoreExplanationQuery } from '@/features/vacancySubmissions/api/vacancySubmissionEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import type { VacancySubmission } from '@/types';
import ClusterChip from './ClusterChip';
import ExpectedSalary from './ExpectedSalary';
import MatchScoreBar from './MatchScoreBar';
import MatchScoreExplanationList from './MatchScoreExplanationList';
import RecruiterRating from './RecruiterRating';

interface ScoreRowProps {
  label: string;
  children: ReactNode;
}

const ScoreRow = ({ label, children }: ScoreRowProps) => (
  <Stack
    direction='row'
    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
  >
    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    {children}
  </Stack>
);

interface SubmissionScoresCardProps {
  submission: VacancySubmission;
}

const SubmissionScoresCard = ({ submission }: SubmissionScoresCardProps) => {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const {
    data: matchScoreExplanation,
    isFetching,
    error,
  } = useGetMatchScoreExplanationQuery(submission.id, {
    skip: !isExplanationOpen,
  });

  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography
          sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
        >
          Match score
        </Typography>

        <MatchScoreBar matchScore={submission.matchScore} height={10} />

        <Button
          size='small'
          variant='text'
          aria-expanded={isExplanationOpen}
          endIcon={isExplanationOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setIsExplanationOpen((isOpen) => !isOpen)}
          sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
        >
          {isExplanationOpen ? 'Hide breakdown' : 'Why this score?'}
        </Button>

        <Collapse in={isExplanationOpen} unmountOnExit>
          {isFetching && (
            <CircularProgress
              size={24}
              aria-label='Loading match score breakdown…'
            />
          )}

          {error && (
            <Alert severity='error'>
              Could not load the match score breakdown -{' '}
              {getErrorMessage(error)}
            </Alert>
          )}

          {matchScoreExplanation && !isFetching && (
            <MatchScoreExplanationList
              explanation={matchScoreExplanation.explanation}
            />
          )}
        </Collapse>

        <ScoreRow label='Expected salary'>
          <ExpectedSalary expectedSalary={submission.expectedSalary} />
        </ScoreRow>

        <ScoreRow label='Recruiter rating'>
          <RecruiterRating
            recruiterRating={submission.recruiterRating}
            variant='text'
          />
        </ScoreRow>

        <ScoreRow label='Cluster'>
          <ClusterChip clusterId={submission.clusterId} />
        </ScoreRow>
      </CardContent>
    </Card>
  );
};

export default SubmissionScoresCard;
