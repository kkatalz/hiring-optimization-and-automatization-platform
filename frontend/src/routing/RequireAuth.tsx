import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

export const RequireAuth = () => {
  const authStatus = useAppSelector((s) => s.auth.status);

  if (authStatus === 'checking' || authStatus === 'loading')
    return <div>Loading...</div>;

  if (authStatus !== 'authenticated') return <Navigate to='/login' replace />;

  return <Outlet />;
};
