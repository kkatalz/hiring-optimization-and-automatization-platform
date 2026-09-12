import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isStaff } from '@/shared/auth/roles';
import type { ReactNode } from 'react';

const drawerWidth = 240;

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

interface PermanentDrawerProps {
  variant: 'permanent' | 'temporary';
  open: boolean;
  onClose: () => void;
}

export default function PermanentDrawer({
  variant,
  open,
  onClose,
}: PermanentDrawerProps) {
  const { status, user } = useAppSelector((state) => state.auth);
  const { pathname } = useLocation();

  const vacanciesItem: NavItem = isStaff(user?.role)
    ? { label: 'Vacancies', to: '/vacancies', icon: <WorkIcon /> }
    : { label: 'Browse vacancies', to: '/browse', icon: <WorkIcon /> };

  const navItems: NavItem[] = [
    { label: 'Home', to: '/', icon: <HomeIcon /> },
    vacanciesItem,
    ...(status === 'authenticated'
      ? [
          {
            label: 'My profile',
            to: '/my-profile',
            icon: <AccountCircleIcon />,
          },
        ]
      : []),
  ];

  // '/vacancies' stays selected while a vacancy or submission is open.
  const isSelected = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      disableScrollLock
      slotProps={{ root: { keepMounted: true } }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.map(({ label, to, icon }) => (
            <ListItem key={to} disablePadding>
              <ListItemButton
                component={Link}
                to={to}
                selected={isSelected(to)}
                // The temporary drawer sits over the page, so it has to get
                // out of the way once it has been used.
                onClick={variant === 'temporary' ? onClose : undefined}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
