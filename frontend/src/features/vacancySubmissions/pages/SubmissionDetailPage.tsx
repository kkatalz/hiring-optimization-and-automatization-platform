import { useGetVacancyByIdQuery } from '@/features/vacancies/api/vacancyEndpoints';
import { useFindSubmissionByIdQuery } from '@/features/vacancySubmissions/api/vacancySubmissionEndpoints';
import { ApplicationStatusWorkflow } from '@/features/vacancySubmissions/components/ApplicationStatusWorkflow';
import CandidateInfo from '@/features/vacancySubmissions/components/CandidateInfo';
import SubmissionDecisionButtons from '@/features/vacancySubmissions/components/SubmissionDecisionButtons';
import { capitalizeName } from '@/shared/lib/formatText';
import AppBreadcrumbs from '@/shared/ui/AppBreadcrumbs';
import LanguagesChips from '@/shared/ui/LanguagesChips';
import NotificationAlert from '@/shared/ui/NotificationAlert';
import type { Notification } from '@/types';
import { skipToken } from '@reduxjs/toolkit/query';
import { Alert, Card, CardContent, Divider, Grid } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const SubmissionDetailPage = () => {
  const { vacancyId, submissionId } = useParams();

  const [notification, setNotification] = useState<Notification | null>(null);

  const {
    data: submission,
    isLoading,
    isError,
  } = useFindSubmissionByIdQuery(submissionId ?? skipToken);

  const { data: vacancy } = useGetVacancyByIdQuery(vacancyId ?? skipToken);

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
      <AppBreadcrumbs
        items={[
          { label: 'Vacancies', to: '/vacancies' },
          {
            label: vacancy ? capitalizeName(vacancy.name) : 'Vacancy',
            to: `/vacancies/${submission.vacancyId}/candidates`,
          },
          {
            label: capitalizeName(
              `${candidateProfile.firstName} ${candidateProfile.lastName}`,
            ),
          },
        ]}
      />

      <NotificationAlert
        notification={notification}
        onClose={() => setNotification(null)}
      />

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
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <ApplicationStatusWorkflow submissionStatus={submission.status} />

              <Divider />

              <SubmissionDecisionButtons
                submissionId={submission.id}
                submissionStatus={submission.status}
                onNotify={(message, severity) =>
                  setNotification({ message, severity })
                }
                variant='outlined'
                size='medium'
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default SubmissionDetailPage;
