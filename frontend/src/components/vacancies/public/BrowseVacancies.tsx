import { Box, CssBaseline, Stack, Toolbar, Typography } from '@mui/material';
import { useAppSelector } from '@/app/hooks';
import { useBrowseVacanciesQuery } from '@/features/api/api';
import AppTopBar from '@/layout/AppTopBar';
import PermanentDrawer from '@/layout/PermanentDrawer';
import { VacanciesFilters } from '../VacanciesFilters';
import { VacanciesList } from '../VacanciesList';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/types';

const BrowseVacancies = () => {
  const { status, user } = useAppSelector((state) => state.auth);

  const appliedFilters = useAppSelector((state) => state.vacancyFilters);
  const { data, isLoading, isError, error } = useBrowseVacanciesQuery({
    filters: appliedFilters,
  });

  const numberOfAvailableVacancies = data?.total ?? 0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {status === 'authenticated' &&
        user &&
        user.role !== UserRole.candidate && (
          <Navigate to='/vacancies' replace />
        )}

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
              <Typography
                variant='subtitle1'
                gutterBottom
                color='textSecondary'
              >
                {numberOfAvailableVacancies} open positions
              </Typography>
            </Stack>
          </Stack>
          <VacanciesFilters />
          <VacanciesList
            data={data}
        isError={isError}
            error={error}
            showVacancyDetailed={(vacancy) => `/browse/${vacancy.id}`}
          />
        </Box>
      </Box>
    </>
  );
};

export default BrowseVacancies;
