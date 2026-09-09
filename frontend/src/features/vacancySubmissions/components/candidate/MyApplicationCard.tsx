import {
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { formatDate } from '@/shared/lib/formatDate';
import type { CandidateSubmission } from '@/types';
import ApplicationStatusChip from '../details/ApplicationStatusChip';
import ExpectedSalary from '../details/ExpectedSalary';
import { ApplicationStatusWorkflow } from '../details/ApplicationStatusWorkflow';

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

const DetailRow = ({ label, children }: DetailRowProps) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={{ xs: 0.25, sm: 2 }}
    sx={{ alignItems: { sm: 'center' } }}
  >
    <Typography variant='body2' sx={{ color: 'text.secondary', minWidth: 140 }}>
      {label}
    </Typography>
    {children}
  </Stack>
);

interface MyApplicationCardProps {
  submission: CandidateSubmission;
}

/** What the candidate sent for this vacancy */
const MyApplicationCard = ({ submission }: MyApplicationCardProps) => (
  <Card>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack
        direction='row'
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          px: 1,
        }}
      >
        <Typography variant='h6'>Your application</Typography>
        <ApplicationStatusChip submissionStatus={submission.status} />
      </Stack>

      <ApplicationStatusWorkflow submissionStatus={submission.status} />

      <Divider />

      <Stack spacing={1.5}>
        <DetailRow label='Applied'>
          <Typography variant='body2'>
            {formatDate(submission.createdAt)}
          </Typography>
        </DetailRow>

        <DetailRow label='Expected salary'>
          <ExpectedSalary expectedSalary={submission.expectedSalary} />
        </DetailRow>

        <DetailRow label='Resume'>
          <Typography
            variant='body2'
            sx={{
              color: submission.resume ? 'text.primary' : 'text.secondary',
            }}
          >
            {submission.resume ? 'Attached' : 'Not attached'}
          </Typography>
        </DetailRow>

        {submission.matchScore != null && (
          <DetailRow label='Match score'>
            <Chip label={`${submission.matchScore.toFixed(2)}%`} size='small' />
          </DetailRow>
        )}

        {submission.tags?.length ? (
          <DetailRow label='Skills you listed'>
            <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {submission.tags.map((tag) => (
                <Chip key={tag} label={tag} size='small' variant='outlined' />
              ))}
            </Stack>
          </DetailRow>
        ) : null}
      </Stack>

      {submission.comment && (
        <>
          <Divider />

          <Stack spacing={0.5}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Your cover note
            </Typography>
            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
              {submission.comment}
            </Typography>
          </Stack>
        </>
      )}
    </CardContent>
  </Card>
);

export default MyApplicationCard;
