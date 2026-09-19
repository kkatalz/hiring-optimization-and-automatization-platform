import { Stack, Typography } from '@mui/material';

interface VacancyDescriptionProps {
  description?: string;
}

/** The description block, shared by the staff and the candidate overview. */
const VacancyDescription = ({ description }: VacancyDescriptionProps) => (
  <Stack spacing={1}>
    <Typography variant='subtitle1' color='textSecondary'>
      DESCRIPTION
    </Typography>

    <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
      {description || 'No description provided.'}
    </Typography>
  </Stack>
);

export default VacancyDescription;
