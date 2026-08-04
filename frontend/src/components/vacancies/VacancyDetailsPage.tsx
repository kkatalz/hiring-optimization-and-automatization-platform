import { useState } from 'react';
import { Alert, CircularProgress } from '@mui/material';
import { Outlet, useParams } from 'react-router-dom';
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
      <VacancyDetailsBreadcrumbs vacancyName={vacancy.name} />

      <VacancyDetailsHeader
        vacancy={vacancy}
        onNotify={(message, severity) => setNotification({ message, severity })}
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

      <VacancyTabs vacancy={vacancy} submissions={submissions} />

      <Outlet />
    </>
  );
};

export default VacancyDetailsPage;
