import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { refreshSession } from '../features/auth/authSlice';
import { Outlet } from 'react-router-dom';

export const RootLayout = () => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((s) => s.auth.status);
  const dispatchWasCalled = useRef(false);

  useEffect(() => {
    if (authStatus === 'checking' && !dispatchWasCalled.current) {
      dispatch(refreshSession());
      dispatchWasCalled.current = true;
    }
  }, [authStatus, dispatch]);

  return <Outlet />;
};
