import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router-dom';
import AppTopBar from './AppTopBar';
import PermanentDrawer from './PermanentDrawer';

interface AppLayoutProps {
  withDrawer: boolean;
}

export const AppLayout = ({ withDrawer }: AppLayoutProps) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <AppTopBar />
      {withDrawer && (
        <PermanentDrawer variant={isMobile ? 'temporary' : 'permanent'} />
      )}

      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          py: 3,
          px: { xs: 2, sm: 3, md: 10 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
