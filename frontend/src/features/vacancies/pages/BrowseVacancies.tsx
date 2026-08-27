import { useAppSelector } from '@/app/hooks';
import { useBrowseVacanciesQuery } from '@/features/vacancies/api/vacancyEndpoints';
import { Stack, Typography } from '@mui/material';
import { VacanciesFilters } from '../components/VacanciesFilters';
import { VacanciesList } from '../components/VacanciesList';

const BrowseVacancies = () => {
  const appliedFilters = useAppSelector((state) => state.vacancyFilters);
  const { data, isLoading, isError, error } = useBrowseVacanciesQuery({
    filters: appliedFilters,
  });

  const numberOfAvailableVacancies = data?.total ?? 0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
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
      </Stack>
      <VacanciesFilters />
      <VacanciesList
        data={data}
        isError={isError}
        error={error}
        showVacancyDetailed={(vacancy) => `/browse/${vacancy.id}`}
      />
    </>
  );
};

export default BrowseVacancies;
