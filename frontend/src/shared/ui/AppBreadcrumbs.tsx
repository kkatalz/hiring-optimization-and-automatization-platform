import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';

export interface Crumb {
  label: string;
  // Omit `to` to render the crumb as plain text (the last crumb is always plain text)
  to?: string;
}

interface AppBreadcrumbsProps {
  items: Crumb[];
}

const AppBreadcrumbs = ({ items }: AppBreadcrumbsProps) => {
  return (
    <Breadcrumbs
      aria-label='breadcrumb'
      separator={<NavigateNextIcon fontSize='small' />}
      sx={{ mb: 2 }}
    >
      {items.map(({ label, to }, index) => {
        const isCurrentPage = index === items.length - 1;

        if (isCurrentPage || !to)
          return (
            <Typography
              key={label}
              sx={{ color: 'text.primary' }}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {label}
            </Typography>
          );

        return (
          <Link
            key={label}
            component={RouterLink}
            to={to}
            color='text.secondary'
            underline='hover'
          >
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default AppBreadcrumbs;
