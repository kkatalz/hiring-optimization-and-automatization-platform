import { Box, Chip, Stack, Typography } from '@mui/material';
import type { CandidateSubmission } from '@/types';
import MyApplicationRow from './MyApplicationRow';
import SectionCard from './SectionCard';

interface MyApplicationsCardProps {
  submissions?: CandidateSubmission[];
}

const MyApplicationsCard = ({ submissions }: MyApplicationsCardProps) => {
  const applications = [...(submissions ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <SectionCard
      title='My applications'
      action={
        applications.length > 0 && (
          <Chip label={applications.length} size='small' />
        )
      }
    >
      {applications.length === 0 ? (
        <Typography
          variant='body2'
          sx={{ color: 'text.secondary', fontStyle: 'italic' }}
        >
          You have not applied to any vacancy yet.
        </Typography>
      ) : (
        <Stack divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
          {applications.map((application) => (
            <MyApplicationRow key={application.id} application={application} />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
};

export default MyApplicationsCard;
