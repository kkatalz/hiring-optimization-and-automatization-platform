import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ApplicationStatusChip from '@/features/vacancySubmissions/components/details/ApplicationStatusChip';
import ExpectedSalary from '@/features/vacancySubmissions/components/details/ExpectedSalary';
import { formatDate } from '@/shared/lib/formatDate';
import { capitalizeName } from '@/shared/lib/formatText';
import type { CandidateSubmission } from '@/types';
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
            <Stack
              key={application.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                py: 1.5,
                px: 1,
                mx: -1,
                borderRadius: 1,
                transition: 'background-color 90ms',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Link
                  component={RouterLink}
                  to={`/browse/${application.vacancyId}`}
                  underline='hover'
                  sx={{ fontWeight: 600 }}
                >
                  {application.vacancyName
                    ? capitalizeName(application.vacancyName)
                    : 'View vacancy'}
                </Link>

                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Applied {formatDate(application.createdAt)}
                </Typography>
              </Stack>

              <Stack
                direction='row'
                spacing={2}
                sx={{ alignItems: 'center', flexShrink: 0 }}
              >
                <ExpectedSalary expectedSalary={application.expectedSalary} />
                <ApplicationStatusChip submissionStatus={application.status} />
                <Chip
                  label={`Matched by: ${application.matchScore?.toFixed(2)}%`}
                  size='small'
                />
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
};

export default MyApplicationsCard;
