import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '../../app/hooks';
import { useSearchVacanciesQuery } from '../../features/api/vacancyApi';
import PrimarySearchAppBar from './PrimarySearchAppBar';
import PermanentDrawer from './PermanentDrawer';
import { VacanciesFilters } from './VacanciesFilters';
import { VacanciesList } from './VacanciesList';
import CreateVacancy from './CreateVacancy';
import { Stack } from '@mui/material';

const MainVacanciesPage = () => {
  const appliedFilters = useAppSelector((state) => state.filters);
  const { data } = useSearchVacanciesQuery({ filters: appliedFilters });

  const numberOfAvailableVacancies = data?.total ?? 0;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <PrimarySearchAppBar />
      <PermanentDrawer />
      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexGrow: 5,
          p: 3,
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
        <VacanciesList />
      </Box>
    </Box>
  );
};

export default MainVacanciesPage;
