import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router-dom';
import AppTopBar from './AppTopBar';
import PermanentDrawer from './PermanentDrawer';

interface AppLayoutProps {
  withDrawer: boolean;
}

export const AppLayout = ({ withDrawer }: AppLayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <AppTopBar />
      {withDrawer && <PermanentDrawer />}

      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          paddingY: 3,
          paddingX: 10,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
