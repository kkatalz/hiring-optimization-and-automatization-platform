import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <Box component='main' sx={{ p: 3 }}>
      <Outlet />
    </Box>
  );
};

export default AppLayout;
