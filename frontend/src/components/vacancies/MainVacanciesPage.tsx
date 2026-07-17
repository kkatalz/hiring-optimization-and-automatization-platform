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
          flexGrow: 1,
          p: 3,
        }}
      >
        <Toolbar />
        <Typography variant='h5' gutterBottom>
          Vacancies
        </Typography>
        <Typography variant='subtitle1' gutterBottom color='textSecondary'>
          {numberOfAvailableVacancies} open positions
        </Typography>
        <VacanciesFilters />
        <VacanciesList />
      </Box>
    </Box>
  );
};

export default MainVacanciesPage;
