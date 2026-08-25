import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import { capitalizeName } from '@/shared/lib/formatText';

interface VacancyDetailsBreadcrumbsProps {
  vacancyName: string;
  rootTo?: string;
  rootLabel?: string;
}

const VacancyDetailsBreadcrumbs = ({
  vacancyName,
  rootTo = '/vacancies',
  rootLabel = 'Vacancies',
}: VacancyDetailsBreadcrumbsProps) => {
  return (
    <Breadcrumbs
      aria-label='breadcrumb'
      separator={<NavigateNextIcon fontSize='small' />}
      sx={{ mb: 2 }}
    >
      <Link
        component={RouterLink}
        to={rootTo}
        color='text.secondary'
        underline='hover'
      >
        {rootLabel}
      </Link>

      <Typography sx={{ color: 'text.primary' }}>
        {capitalizeName(vacancyName)}
      </Typography>
    </Breadcrumbs>
  );
};

export default VacancyDetailsBreadcrumbs;
