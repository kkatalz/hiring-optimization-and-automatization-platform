import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useSearchVacanciesQuery } from '@/features/api/api';
import AppTopBar from '../layout/AppTopBar';
import PermanentDrawer from '../layout/PermanentDrawer';
import { VacanciesFilters } from './VacanciesFilters';
import { VacanciesList } from './VacanciesList';
import CreateVacancy from './CreateVacancy';
import UpdateVacancyForm from './UpdateVacancy';
import DeleteVacancyButton from './DeleteVacancyButton';
import { toUpdateVacancyInput } from '@/features/vacancies/model/vacancyMappers';
import type { Notification } from '@/types';

const MainVacanciesPage = () => {
  const appliedFilters = useAppSelector((state) => state.vacancyFilters);
  const { data, isLoading, isError, error } = useSearchVacanciesQuery({
    filters: appliedFilters,
  });

  const [notification, setNotification] = useState<Notification | null>(null);

  const numberOfAvailableVacancies = data?.total ?? 0;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppTopBar />
      <PermanentDrawer />
      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexGrow: 5,
          paddingY: 3,
          paddingX: 10,
        }}
      >
        <Toolbar />
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
          isLoading={isLoading}
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
      </Box>
    </Box>
  );
};

export default MainVacanciesPage;
