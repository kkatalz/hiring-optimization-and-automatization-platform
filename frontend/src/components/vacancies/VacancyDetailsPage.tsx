import {
  Breadcrumbs,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink, Outlet, useParams } from 'react-router-dom';
import ShortVacancyInfo from './ShortVacancyInfo';
import {
  useGetSubmissionsByVacancyIdQuery,
  useGetVacancyByIdQuery,
} from '../../features/api/api';
import { skipToken } from '@reduxjs/toolkit/query';
import { capitalizeVacancyName } from '../../utils/formatText';
import Link from '@mui/material/Link';

const VacancyDetailsPage = () => {
  const { vacancyId } = useParams();
  const { data: vacancy, isError } = useGetVacancyByIdQuery(
    (vacancyId as string) ?? skipToken,
  );

  const { data: submissions } = useGetSubmissionsByVacancyIdQuery({
    vacancyId: (vacancyId as string) ?? skipToken,
  });

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

      <ShortVacancyInfo vacancy={vacancy} index={0} showDescription={false} />

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
      <Outlet />
    </>
  );
};

export default VacancyDetailsPage;
