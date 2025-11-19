import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TimelineIcon from '@mui/icons-material/Timeline';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const drawerWidth = 260;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Issue Board', icon: <ViewKanbanIcon />, path: '/issues/board' },
  { label: 'Insights', icon: <TimelineIcon />, path: '/insights' },
  { label: 'Admin', icon: <SettingsIcon />, path: '/admin' },
];

type AppLayoutProps = {
  children?: ReactNode;
};

const getInitials = (email?: string | null) => {
  if (!email) return 'U';
  const [namePart] = email.split('@');
  return namePart
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const { user, signOut } = useAuth();
  const initials = getInitials(user?.email);

  const drawer = (
    <Box display="flex" flexDirection="column" height="100%">
      <Box p={3} display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          IT
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            Issue Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ops & Tech Command Center
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                if (!isDesktop) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box p={2.5} display="flex" alignItems="center" gap={2}>
        <Avatar>{initials || 'U'}</Avatar>
        <Box flexGrow={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Operations & Tech
          </Typography>
        </Box>
        <IconButton onClick={signOut} color="primary">
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen((prev) => !prev)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h5" fontWeight={600} color="primary.main">
            Customer Issue Command Center
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ flexShrink: { lg: 0 }, width: { lg: drawerWidth } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 4 },
          mt: { xs: 7, md: 8 },
          width: '100%',
        }}
      >
        {children ?? <Outlet />}
      </Box>
    </Box>
  );
};

export default AppLayout;
