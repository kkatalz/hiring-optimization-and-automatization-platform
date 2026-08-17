import { List, Pagination } from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setPage } from '../../features/filters/vacancyFiltersSlice';
import { getErrorMessage } from '../../utils/errorMessage';
import VacancyCard from './VacancyCard';
import type { PaginatedResponse, VacancySummary } from '../../../types';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

interface Props<VacancyExtended extends VacancySummary> {
  data?: PaginatedResponse<VacancyExtended>;
  isLoading: boolean;
  isError: boolean;
  error?: FetchBaseQueryError | SerializedError;
  showVacancyDetailed: (vacancy: VacancyExtended) => string;
  renderActions?: (vacancy: VacancyExtended) => ReactNode;
}

/** Used for both Vacancy and the public GeneralVacancy) */
export const VacanciesList = <VacancyExtended extends VacancySummary>({
  data,
  isLoading,
  isError,
  error,
  showVacancyDetailed,
  renderActions,
}: Props<VacancyExtended>) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const appliedFilters = useAppSelector((state) => state.vacancyFilters);

  const currentPage = appliedFilters.page ?? 1;

  if (isLoading) return <div>Loading...</div>;

  if (isError)
    return <div>Could not load vacancies - {getErrorMessage(error)}</div>;

  return (
    <List
      sx={{
        width: '100%',
        minWidth: '330px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {data?.data.map((vacancy, index) => (
        <VacancyCard
          key={vacancy.id}
          vacancy={vacancy}
          index={index}
          actions={renderActions?.(vacancy)}
          onClick={() => navigate(showVacancyDetailed(vacancy))}
        />
      ))}

      <Pagination
        count={data?.totalPages ?? 0}
        shape='rounded'
        color='primary'
        size='large'
        sx={{ alignSelf: 'center' }}
        onChange={(_event, page) => {
          dispatch(setPage(page));
        }}
        page={currentPage}
      />
    </List>
  );
};
