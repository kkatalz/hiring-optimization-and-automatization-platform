import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { VacancySubmission } from '@/types';
import ClusterChip from './ClusterChip';
import ExpectedSalary from './ExpectedSalary';
import MatchScoreBar from './MatchScoreBar';
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
  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography
          sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
        >
          Match score
        </Typography>

        <MatchScoreBar matchScore={submission.matchScore} height={10} />

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
