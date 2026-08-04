import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import { capitalizeName } from '../../../utils/formatText';

interface VacancyDetailsBreadcrumbsProps {
  vacancyName: string;
}

const VacancyDetailsBreadcrumbs = ({
  vacancyName,
}: VacancyDetailsBreadcrumbsProps) => {
  return (
    <Breadcrumbs
      aria-label='breadcrumb'
      separator={<NavigateNextIcon fontSize='small' />}
      sx={{ mb: 2 }}
    >
      <Link
        component={RouterLink}
        to='/vacancies'
        color='text.secondary'
        underline='hover'
      >
        Vacancies
      </Link>

      <Typography sx={{ color: 'text.primary' }}>
        {capitalizeName(vacancyName)}
      </Typography>
    </Breadcrumbs>
  );
};

export default VacancyDetailsBreadcrumbs;
