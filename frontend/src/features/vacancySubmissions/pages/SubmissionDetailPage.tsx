import { useFindSubmissionByIdQuery } from '@/features/vacancySubmissions/api/vacancySubmissionEndpoints';
import { ApplicationStatusWorkflow } from '@/features/vacancySubmissions/components/ApplicationStatusWorkflow';
import CandidateInfo from '@/features/vacancySubmissions/components/CandidateInfo';
import LanguagesChips from '@/shared/ui/LanguagesChips';
import { Alert, Card, CardContent, Grid } from '@mui/material';
import { useParams } from 'react-router-dom';

const SubmissionDetailPage = () => {
  const submissionId = useParams().submissionId as string;

  const {
    data: submission,
    isLoading,
    isError,
  } = useFindSubmissionByIdQuery(submissionId);

  const candidateProfile = submission?.candidateProfile;

  if (isLoading) return <div>Loading...</div>;
  if (isError || !submission || !candidateProfile)
    return (
      <Alert severity='error'>
        Could not load vacancy submission. Try refreshing the page or contact
        support if the problem persists.
      </Alert>
    );

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={4}>
          <Card>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {candidateProfile && (
                <>
                  <CandidateInfo
                    candidateProfile={candidateProfile}
                    globalDirection='column'
                    showChipOrAvatar={'avatar'}
                  />
                  <LanguagesChips languages={candidateProfile.languages} />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={8}>
          <Card>
            <CardContent>
              <ApplicationStatusWorkflow submissionStatus={submission.status} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default SubmissionDetailPage;
