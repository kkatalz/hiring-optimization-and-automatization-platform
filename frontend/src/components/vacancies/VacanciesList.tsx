import { Alert, List, Snackbar } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getErrorMessage } from '../../utils/errorMessage';
import { useSearchVacanciesQuery } from '../../features/api/vacancyApi';
import { setPage } from '../../features/filters/filterSlice';
import VacancyCard from './VacancyCard';

export type Notification = {
  message: string;
  severity: 'success' | 'error';
};

export const VacanciesList = () => {
  const dispatch = useAppDispatch();

  const [notification, setNotification] = useState<Notification | null>(null);

  const appliedFilters = useAppSelector((state) => state.filters);

  const currentPage =
    typeof appliedFilters.page === 'number' ? appliedFilters.page : 1;

  const {
    data: filteredData,
    isLoading: isFilteredLoading,
    isError: isFilteredError,
    error: filteredError,
  } = useSearchVacanciesQuery({ filters: appliedFilters });

  if (isFilteredLoading) return <div>Loading...</div>;

  if (isFilteredError)
    return (
      <div>Could not load vacancies - {getErrorMessage(filteredError)}</div>
    );

  return (
    <List
      sx={{
        minWidth: '330px',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {filteredData?.data.map((vacancy, index) => (
        <VacancyCard
          key={vacancy.id}
          vacancy={vacancy}
          index={index}
          setNotification={(message, severity) =>
            setNotification({ message, severity })
          }
        />
      ))}

      {(filteredData?.totalPages ?? 0) > 1 && appliedFilters.page && (
        <>
          <button
            disabled={appliedFilters.page <= 1}
            onClick={() => dispatch(setPage(currentPage - 1))}
          >
            Prev
          </button>
          <button
            disabled={currentPage >= (filteredData?.totalPages ?? 0)}
            onClick={() => dispatch(setPage(currentPage + 1))}
          >
            Next
          </button>
        </>
      )}

      <Snackbar
        open={notification !== null}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification ? (
          <Alert
            severity={notification.severity}
            variant='filled'
            onClose={() => setNotification(null)}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </List>
  );
};
