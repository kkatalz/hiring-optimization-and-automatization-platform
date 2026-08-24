import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <Box component='main' sx={{ paddingX: 4, paddingY: 3 }}>
      <Outlet />
    </Box>
  );
};

export default AppLayout;
