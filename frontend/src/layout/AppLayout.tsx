import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppTopBar from './AppTopBar';
import PermanentDrawer from './PermanentDrawer';

interface AppLayoutProps {
  showDrawer: boolean;
}

export const AppLayout = ({ showDrawer }: AppLayoutProps) => {
  const isScreenMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <AppTopBar
        onMobileMenuClick={
          showDrawer ? () => setDrawerOpen((prev) => !prev) : undefined
        }
      />
      {showDrawer && (
        <PermanentDrawer
          variant={isScreenMobile ? 'temporary' : 'permanent'}
          open={isScreenMobile ? drawerOpen : true}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
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
