import Typography from '@mui/material/Typography';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useSearchVacanciesQuery } from '@/features/api/api';
import { VacanciesFilters } from '../components/VacanciesFilters';
import { VacanciesList } from '../components/VacanciesList';
import CreateVacancy from '../components/dialogs/CreateVacancy';
import UpdateVacancyForm from '../components/dialogs/UpdateVacancy';
import DeleteVacancyButton from '../components/dialogs/DeleteVacancyButton';
import { toUpdateVacancyInput } from '@/features/vacancies/model/vacancyMappers';
import type { Notification } from '@/types';

const MainVacanciesPage = () => {
  const appliedFilters = useAppSelector((state) => state.vacancyFilters);
  const { data, isLoading, isError, error } = useSearchVacanciesQuery({
    filters: appliedFilters,
  });

  const [notification, setNotification] = useState<Notification | null>(null);

  const numberOfAvailableVacancies = data?.total ?? 0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Stack
        direction='row'
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Stack direction='column' spacing={1} sx={{ mb: 2 }}>
          <Typography variant='h5' gutterBottom>
            Vacancies
          </Typography>
          <Typography variant='subtitle1' gutterBottom color='textSecondary'>
            {numberOfAvailableVacancies} open positions
          </Typography>
        </Stack>
        <CreateVacancy />
      </Stack>
      <VacanciesFilters />
      <VacanciesList
        data={data}
        isError={isError}
        error={error}
        showVacancyDetailed={(vacancy) => `/vacancies/${vacancy.id}`}
        renderActions={(vacancy) => (
          <>
            <UpdateVacancyForm
              vacancyId={vacancy.id}
              initialData={toUpdateVacancyInput(vacancy)}
            />
            <DeleteVacancyButton
              vacancyId={vacancy.id}
              onNotify={(message, severity) =>
                setNotification({ message, severity })
              }
            />
          </>
        )}
      />

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
    </>
  );
};

export default MainVacanciesPage;
