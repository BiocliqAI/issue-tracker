import { Box, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: 'linear-gradient(120deg, #1f3c88 0%, #ff6b6b 100%)',
        p: 3,
      }}
    >
      <Paper elevation={0} sx={{ maxWidth: 420, width: '100%', p: 4, borderRadius: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Issue Tracker Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Authenticate to access the Ops & Tech customer issue workspace.
          </Typography>
        </Box>
        {children}
      </Paper>
    </Box>
  );
};

export default AuthLayout;
