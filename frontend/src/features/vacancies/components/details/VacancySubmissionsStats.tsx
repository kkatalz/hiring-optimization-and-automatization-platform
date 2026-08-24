import { CircularProgress, Stack } from '@mui/material';
import type { VacancySubmission } from '@/types';
import { getSubmissionStats } from '@/features/vacancySubmissions/model/submissionStats';
import StatCard from '@/shared/ui/StatCard';

interface VacancySubmissionsStatsProps {
  /** Comes from the vacancy itself, so it stays correct even under filtering. */
  totalSubmissions: number;
  submissions: VacancySubmission[] | undefined;
  isLoading: boolean;
}

/** Row of stat cards summarising the vacancy's submissions. */
const VacancySubmissionsStats = ({
  totalSubmissions,
  submissions,
  isLoading,
}: VacancySubmissionsStatsProps) => {
  if (isLoading) return <CircularProgress aria-label='Loading…' />;

  const stats = getSubmissionStats(submissions);

  return (
    <Stack
      direction='row'
      sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}
    >
      <StatCard label='SUBMISSIONS' value={totalSubmissions} />
      <StatCard label='PENDING' value={stats.pending} valueColor='info.main' />
      <StatCard
        label='INTERVIEWING'
        value={stats.interviewing}
        valueColor='info.contrastText'
      />
      <StatCard
        label='CLUSTERS'
        value={stats.clusters}
        valueColor='info.dark'
      />
    </Stack>
  );
};

export default VacancySubmissionsStats;
