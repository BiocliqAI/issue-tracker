import { Box, Link, Stack, TextField, Typography, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.tsx';
import { useAuth } from '../context/AuthContext.tsx';

type LoginForm = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const { signIn, register } = useAuth();
  const navigate = useNavigate();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (mode === 'login') {
        await signIn(data.email, data.password);
      } else {
        await register(data.email, data.password);
      }
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          <TextField
            label="Work Email"
            type="email"
            fullWidth
            autoFocus
            {...registerField('email', {
              required: 'Email is required',
              pattern: {
                value: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
                message: 'Enter a valid email',
              },
            })}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            {...registerField('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />
          {errorMessage && (
            <Typography color="error" variant="body2">
              {errorMessage}
            </Typography>
          )}
          <Button type="submit" variant="contained" size="large" loading={loading} fullWidth>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {mode === 'login' ? 'Need an account?' : 'Already registered?'}{' '}
            <Link
              component="button"
              type="button"
              onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
              underline="hover"
            >
              {mode === 'login' ? 'Create one' : 'Sign in instead'}
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;
