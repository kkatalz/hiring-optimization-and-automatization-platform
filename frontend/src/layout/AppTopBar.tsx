import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logoutSession } from '@/features/auth/model/authSlice';
import type { Notification } from '@/types';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Alert, Snackbar, Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AppTopBarProps {
  onMobileMenuClick: () => void;
}

export default function AppTopBar({ onMobileMenuClick }: AppTopBarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { status } = useAppSelector((state) => state.auth);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    if (status !== 'authenticated') {
      navigate('/login');
      return;
    }

    setNotification({
      message: 'You are already logged in!',
      severity: 'success',
    });
  };

  const handleLogout = async () => {
    if (status !== 'authenticated') {
      setNotification({
        message: 'You are not logged in!',
        severity: 'error',
      });
      return;
    }

    await dispatch(logoutSession());
    navigate('/login');
  };

  const handleCreateAccount = () => {
    if (status !== 'authenticated') {
      navigate('/register');
      return;
    }

    setNotification({
      message:
        'You are already logged in! Please log out to create a new account.',
      severity: 'success',
    });
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
      disableScrollLock
    >
      <MenuItem onClick={handleLogin}>Login</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
      <MenuItem onClick={handleCreateAccount}>Create account</MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            size='large'
            color='inherit'
            aria-label='open navigation menu'
            onClick={onMobileMenuClick}
            sx={{ display: { md: 'none' }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Stack
            direction='row'
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <IconButton size='large' color='inherit'>
              <TravelExploreIcon />
            </IconButton>
            <Typography variant='h6'>Hiring Platform</Typography>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            size='large'
            aria-label='account of current user'
            aria-controls={menuId}
            aria-haspopup='true'
            onClick={handleProfileMenuOpen}
            color='inherit'
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      {renderMenu}

      <Snackbar
        open={notification !== null}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification ? (
          <Alert
            severity={notification.severity}
            variant='filled'
            onClose={() => setNotification(null)}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
