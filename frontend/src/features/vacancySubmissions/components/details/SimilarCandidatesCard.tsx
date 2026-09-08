import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router-dom';
import { useGetSimilarSubmissionsQuery } from '@/features/clustering/api/clusterEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import ApplicationStatusChip from './ApplicationStatusChip';
import MatchScoreBar from './MatchScoreBar';
import CandidateInfo from '../CandidateInfo';

interface SimilarCandidatesCardProps {
  submissionId: string;
  vacancyId: string;
  clusterId?: number | null;
}

/**
 * Useful when a recruiter has judged one application and wants the rest of
 * the same profile, rather than working down the list one by one.
 */
const SimilarCandidatesCard = ({
  submissionId,
  vacancyId,
  clusterId,
}: SimilarCandidatesCardProps) => {
  const navigate = useNavigate();

  const isClustered = clusterId != null;

  // Asking before clustering has run only earns a 400, so don't ask.
  const {
    data: similar,
    isLoading,
    error,
  } = useGetSimilarSubmissionsQuery(isClustered ? submissionId : skipToken);

  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack
          direction='row'
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant='h6'>Similar candidates</Typography>

          {isClustered && (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Cluster {clusterId}
            </Typography>
          )}
        </Stack>

        {!isClustered && (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            This application has not been clustered yet. Use Re-cluster on the
            vacancy page to group candidates by profile.
          </Typography>
        )}

        {isLoading && (
          <CircularProgress aria-label='Loading similar candidates…' />
        )}

        {error && (
          <Alert severity='error'>
            Could not load similar candidates - {getErrorMessage(error)}
          </Alert>
        )}

        {similar?.length === 0 && (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            No other candidate landed in this cluster.
          </Typography>
        )}

        <Stack divider={<Divider flexItem />} spacing={2}>
          {similar?.map((submission) => (
            <Stack
              key={submission.id}
              direction='row'
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              {submission.candidateProfile && (
                <CandidateInfo
                  candidateProfile={submission.candidateProfile}
                  globalDirection='row'
                  showChipOrAvatar='chip'
                />
              )}

              <Stack
                direction='row'
                sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
              >
                <MatchScoreBar
                  matchScore={submission.matchScore}
                  scoreVariant='body2'
                />

                <ApplicationStatusChip submissionStatus={submission.status} />

                <Button
                  variant='text'
                  size='small'
                  onClick={() =>
                    navigate(
                      `/vacancies/${vacancyId}/vacancy-submissions/${submission.id}`,
                    )
                  }
                >
                  View
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SimilarCandidatesCard;
