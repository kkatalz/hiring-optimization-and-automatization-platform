import { useState } from 'react';
import {
  Alert,
  CircularProgress,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import type { Notification } from '../../../types';
import {
  useGetSubmissionsByVacancyIdQuery,
  useGetVacancyByIdQuery,
} from '../../features/api/api';
import { getErrorMessage } from '../../utils/errorMessage';
import NotificationAlert from '../common/NotificationAlert';
import VacancyDetailsBreadcrumbs from './details/VacancyDetailsBreadcrumbs';
import VacancyDetailsHeader from './details/VacancyDetailsHeader';
import VacancySubmissionsStats from './details/VacancySubmissionsStats';
import { VacancyTabs } from './details/VacancyTabs';
import VacancyStaffActions from './details/VacancyStaffActions';
import DeleteVacancyButton from './DeleteVacancyButton';
import AppTopBar from '../layout/AppTopBar';

const VacancyDetailsPage = () => {
  const { vacancyId } = useParams();

  const [notification, setNotification] = useState<Notification | null>(null);

  const {
    data: vacancy,
    isLoading,
    error,
  } = useGetVacancyByIdQuery(vacancyId ?? skipToken);

  const { data: submissions, isLoading: isLoadingSubmissions } =
    useGetSubmissionsByVacancyIdQuery(vacancyId ? { vacancyId } : skipToken);

  if (isLoading) return <CircularProgress aria-label='Loading vacancy…' />;

  if (!vacancy)
    return (
      <Alert severity='error'>
        Could not load the vacancy - {getErrorMessage(error)}
      </Alert>
    );

  return (
    <>
      <AppTopBar />
      <Toolbar />

      <VacancyDetailsBreadcrumbs vacancyName={vacancy.name} />

      <VacancyDetailsHeader
        vacancy={vacancy}
        actions={
          <VacancyStaffActions
            vacancy={vacancy}
            onNotify={(message, severity) =>
              setNotification({ message, severity })
            }
          />
        }
      />

      <NotificationAlert
        notification={notification}
        onClose={() => setNotification(null)}
      />

      <VacancySubmissionsStats
        totalSubmissions={vacancy.numberOfSubmissions ?? 0}
        submissions={submissions}
        isLoading={isLoadingSubmissions}
      />

      <VacancyTabs vacancy={vacancy} />

      <Paper
        sx={{
          p: 2,
          width: '50%',
          mt: 4,
          border: '1px solid #D32F2F',
          marginX: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography variant='h6' color='secondary'>
          ! Danger zone !
        </Typography>
        <Typography variant='body1' color='textSecondary' sx={{ mt: 1, mb: 1 }}>
          Deleting removes the vacancy and cascades to its screening-question
          links and submissions.
        </Typography>

        <DeleteVacancyButton
          vacancyId={vacancy.id}
          onNotify={(message, severity) =>
            setNotification({ message, severity })
          }
        />
      </Paper>
    </>
  );
};

export default VacancyDetailsPage;
