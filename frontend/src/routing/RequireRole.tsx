import { Outlet } from 'react-router-dom';
import { UserRole } from '../types';
import { useAppSelector } from '../app/hooks';
import { Typography } from '@mui/material';

const STAFF_ROLES: UserRole[] = [
  UserRole.superAdmin,
  UserRole.admin,
  UserRole.recruiter,
];

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
