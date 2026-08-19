import { Stack, Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import type { VacancySummary } from '../../../types';

const VacancyOverview = () => {
  const vacancy = useOutletContext<VacancySummary>();

  return (
    <Stack direction='row' spacing={2} sx={{ width: '100%' }}>
      <Stack direction='column' spacing={2} sx={{ width: '60%' }}>
        <Typography variant='subtitle1' color='textSecondary'>
          DESCRIPTION
        </Typography>

        <Typography
          variant='body1'
          sx={{ '&.MuiTypography-root': { marginTop: 1 } }}
        >
          {vacancy.description || 'No description provided.'}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default VacancyOverview;
