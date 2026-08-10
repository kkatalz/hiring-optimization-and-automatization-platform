import { useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { CircularProgress } from '@mui/material';
import { useGetSubmissionsByVacancyIdQuery } from '../../features/api/api';
import { VacancySubmissionsTable } from './VacancySubmissionsTable';

const VacancySubmissionsList = () => {
  const { vacancyId } = useParams();

  const { data: submissions, isLoading } = useGetSubmissionsByVacancyIdQuery(
    vacancyId ? { vacancyId } : skipToken,
  );

  if (isLoading) return <CircularProgress aria-label='Loading candidates…' />;

  return <VacancySubmissionsTable submissions={submissions} />;
};

export default VacancySubmissionsList;
