import { Outlet } from 'react-router-dom';
import { STAFF_ROLES } from '../types';
import { useAppSelector } from '../app/hooks';
import { Typography } from '@mui/material';

export const RequireRole = () => {
  const role = useAppSelector((state) => state.auth.user?.role);

  if (!role || !STAFF_ROLES.includes(role))
    return (
      <Typography>
        Sorry, this page is not accessible for candidates.
      </Typography>
    );

  return <Outlet />;
};
