import { List, Pagination } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setPage } from '@/features/filters/vacancyFiltersSlice';
import { getErrorMessage } from '@/utils/errorMessage';
import VacancyCard from './VacancyCard';
import type { Notification, PaginatedResponse, VacancySummary } from '@/types';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import NotificationAlert from '@/components/common/NotificationAlert';

interface Props<VacancyExtended extends VacancySummary> {
  data?: PaginatedResponse<VacancyExtended>;
  isError: boolean;
  error?: FetchBaseQueryError | SerializedError;
  showVacancyDetailed: (vacancy: VacancyExtended) => string;
  renderActions?: (vacancy: VacancyExtended) => ReactNode;
}

/** Used for both Vacancy and the public GeneralVacancy */
export const VacanciesList = <VacancyExtended extends VacancySummary>({
  data,
  isError,
  error,
  showVacancyDetailed,
  renderActions,
}: Props<VacancyExtended>) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);

  const appliedFilters = useAppSelector((state) => state.vacancyFilters);

  const currentPage = appliedFilters.page ?? 1;

  if (isError)
    setNotification({
      message: `Could not load vacancies - ${getErrorMessage(error)}. Try refreshing the page or contact support if the problem persists.`,
      severity: 'error',
    });

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
      <NotificationAlert
        notification={notification}
        onClose={() => setNotification(null)}
      />

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
