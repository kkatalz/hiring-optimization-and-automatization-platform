import { useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { CircularProgress } from '@mui/material';
import { useGetSubmissionsByVacancyIdQuery } from '@/features/vacancySubmissions/api/vacancySubmissionEndpoints';
import { useAppSelector } from '@/app/hooks';
import { VacancySubmissionsTable } from '../components/VacancySubmissionsTable';
import VacancySubmissionsFilters from '../components/VacancySubmissionsFilters';

const MainVacancySubmissionsPage = () => {
  const { vacancyId } = useParams();

  // Sorting goes to the query string and filtering to the body, so they are
  // split apart here. The backend rejects unknown body fields.
  const { sortBy, order, ...filters } = useAppSelector(
    (state) => state.submissionFilters,
  );

  const { data: submissions, isLoading } = useGetSubmissionsByVacancyIdQuery(
    vacancyId
      ? {
          vacancyId,
          sortQuery: { sortBy, order },
          filterSubmissionsDto: filters,
        }
      : skipToken,
  );

  if (isLoading) return <CircularProgress aria-label='Loading candidates…' />;

  return (
    <>
      <VacancySubmissionsFilters />
      <VacancySubmissionsTable submissions={submissions} />
    </>
  );
};

export default MainVacancySubmissionsPage;
