import {
  Alert,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink, Outlet, useParams } from 'react-router-dom';
import ShortVacancyInfo from './ShortVacancyInfo';
import {
  useGetSubmissionsByVacancyIdQuery,
  useGetVacancyByIdQuery,
  useRunClusteringMutation,
} from '../../features/api/api';
import { skipToken } from '@reduxjs/toolkit/query';
import { capitalizeVacancyName } from '../../utils/formatText';
import Link from '@mui/material/Link';
import UpdateVacancyForm from './UpdateVacancy';
import { useState } from 'react';

const VacancyDetailsPage = () => {
  const { vacancyId } = useParams();
  const { data: vacancy, isError } = useGetVacancyByIdQuery(
    (vacancyId as string) ?? skipToken,
  );

  const { data: submissions, isLoading: isFetchingSubmissions } =
    useGetSubmissionsByVacancyIdQuery({
      vacancyId: (vacancyId as string) ?? skipToken,
    });

  const [runClustering, { isLoading: isClustering }] =
    useRunClusteringMutation();

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleRecluster = async (vacancyId: string) => {
    try {
      await runClustering(vacancyId).unwrap();
      setFeedback({
        type: 'success',
        message: 'Reclustering completed successfully.',
      });
    } catch (error) {
      console.error('Error reclustering submissions:', error);
      setFeedback({
        type: 'error',
        message: 'Error reclustering submissions. Please try again later.',
      });
    }
  };

  const pendingSubmissionsCount = submissions?.filter(
    (s) => s.status.toLowerCase() === 'pending',
  ).length;

  const interviewingSubmissionsCount = submissions?.filter(
    (s) => s.status.toLowerCase() === 'interviewing',
  ).length;

  const clustersCount = submissions?.filter((s) => s.clusterId !== null).length;

  if (!vacancy) return <div>{isError}</div>;

  const breadcrumbs = [
    <Link
      key='vacancies'
      component={RouterLink}
      to='/vacancies'
      color='text.secondary'
      underline='hover'
    >
      Vacancies
    </Link>,

    <Typography key='current-vacancy' sx={{ color: 'text.primary' }}>
      {capitalizeVacancyName(vacancy.name ?? '')}
    </Typography>,
  ];

  return (
    <>
      <Breadcrumbs
        aria-label='breadcrumb'
        separator={<NavigateNextIcon fontSize='small' />}
        sx={{ mb: 2 }}
      >
        {breadcrumbs}
      </Breadcrumbs>

      <Stack
        direction='row'
        sx={{
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <ShortVacancyInfo vacancy={vacancy} index={0} showDescription={false} />
        <Stack
          direction='row'
          spacing={1}
          sx={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 1,
          }}
        >
          <UpdateVacancyForm
            vacancyId={vacancy.id}
            initialData={{
              name: vacancy.name,
              description: vacancy.description,
              minSalary: vacancy.minSalary,
              maxSalary: vacancy.maxSalary,
              timeCommitment: vacancy.timeCommitment,
              languageRequirements: vacancy.languageRequirements,
              requiredYearsOfExperience: vacancy.requiredYearsOfExperience,
              tags: vacancy.tags,
              customWeights: vacancy.customWeights,
            }}
          />
          <Button
            variant='contained'
            onClick={() => handleRecluster(vacancy.id)}
          >
            {isClustering ? 'Reclustering...' : 'Re-cluster'}
          </Button>
        </Stack>
      </Stack>
      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {isFetchingSubmissions ? (
        <CircularProgress aria-label='Loading…' />
      ) : (
        <Stack
          direction='row'
          sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}
        >
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography
                variant='h5'
                component='div'
                sx={{ color: 'text.primary', fontWeight: 'bold' }}
              >
                {vacancy.numberOfSubmissions ?? 0}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                SUBMISSIONS
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography
                variant='h5'
                component='div'
                sx={{ color: 'info.main', fontWeight: 'bold' }}
              >
                {pendingSubmissionsCount}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                PENDING
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography
                variant='h5'
                component='div'
                sx={{ color: 'info.contrastText', fontWeight: 'bold' }}
              >
                {interviewingSubmissionsCount}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                INTERVIEWING
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography
                variant='h5'
                component='div'
                sx={{ color: 'info.dark', fontWeight: 'bold' }}
              >
                {clustersCount}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                CLUSTERS
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}
      <Outlet />
    </>
  );
};

export default VacancyDetailsPage;
