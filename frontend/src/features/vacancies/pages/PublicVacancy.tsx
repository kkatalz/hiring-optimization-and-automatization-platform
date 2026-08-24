import { Outlet, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { Alert, CircularProgress } from '@mui/material';
import { useBrowseVacancyByIdQuery } from '@/features/api/api';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import VacancyDetailsBreadcrumbs from '../components/details/VacancyDetailsBreadcrumbs';
import VacancyDetailsHeader from '../components/details/VacancyDetailsHeader';
import type { VacancyOutletContext } from '../model/useVacancyOutletContext';

const PublicVacancy = () => {
  const { vacancyId } = useParams();

  const {
    data: vacancy,
    isLoading,
    error,
  } = useBrowseVacancyByIdQuery(vacancyId ?? skipToken);

  if (isLoading) return <CircularProgress aria-label='Loading vacancy…' />;

  if (!vacancy)
    return (
      <Alert severity='error'>
        Could not load the vacancy - {getErrorMessage(error)}
      </Alert>
    );

  return (
    <>
      <VacancyDetailsBreadcrumbs vacancyName={vacancy.name} rootTo='/' />

      <VacancyDetailsHeader vacancy={vacancy} />

      <Outlet context={{ vacancy } satisfies VacancyOutletContext} />
    </>
  );
};

export default PublicVacancy;
