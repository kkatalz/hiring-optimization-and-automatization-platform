import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import type { ReactNode } from 'react';

const drawerWidth = 240;

type NavItem = {
  label: string;
  icon: ReactNode;
};

const mainNavItems: NavItem[] = [
  { label: 'Vacancies', icon: <WorkIcon /> },
  { label: 'Candidates', icon: <PeopleIcon /> },
  { label: 'Submissions', icon: <AssignmentIcon /> },
  { label: 'Interviews', icon: <EventIcon /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Tenant settings', icon: <SettingsIcon /> },
  { label: 'Users & Roles', icon: <ManageAccountsIcon /> },
];

const renderNavList = (items: NavItem[]) => (
  <List>
    {items.map(({ label, icon }) => (
      <ListItem key={label} disablePadding>
        <ListItemButton>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={label} />
        </ListItemButton>
      </ListItem>
    ))}
  </List>
);

export default function PermanentDrawer() {
  return (
    <Drawer
      variant='permanent'
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
        {renderNavList(mainNavItems)}
        <Divider />
        {renderNavList(adminNavItems)}
      </Box>
    </Drawer>
  );
}
