import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { isStaff } from '@/shared/auth/roles';

export const RedirectStaff = () => {
  const { status, user } = useAppSelector((s) => s.auth);

  if (status === 'checking' || status === 'loading')
    return <div>Loading...</div>;

  if (status === 'authenticated' && isStaff(user?.role))
    return <Navigate to='/vacancies' replace />;

  return <Outlet />;
};
