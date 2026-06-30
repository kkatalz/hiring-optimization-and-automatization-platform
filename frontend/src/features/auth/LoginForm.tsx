import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login } from './authSlice';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

interface LoginFields {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const [loginFields, setLoginFields] = useState<LoginFields>({
    email: '',
    password: '',
  });
  const { status, user, error } = useAppSelector((state) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFields({ ...loginFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(
        login({ email: loginFields.email, password: loginFields.password }),
      ).unwrap();
      navigate('/vacancies');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Container
      maxWidth='xs'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant='h5'>Sign in</Typography>
        <Typography variant='body2' color='text.secondary'>
          Hiring Platform · recruiter portal
        </Typography>

        {/* Email & Password */}
        <Stack
          onSubmit={handleSubmit}
          direction='column'
          component='form'
          spacing={2}
          sx={{ width: '100%', mt: 2 }}
        >
          {error && <Alert severity='error'>{error}</Alert>}

          <TextField
            name='email'
            label='Email'
            type='email'
            size='small'
            fullWidth
            value={loginFields.email}
            onChange={handleChange}
          />
          <TextField
            name='password'
            label='Password'
            type='password'
            size='small'
            fullWidth
            value={loginFields.password}
            onChange={handleChange}
          />

          <Button
            variant='contained'
            type='submit'
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Logging in...' : 'SIGN IN'}
          </Button>
        </Stack>
        {status === 'authenticated' && user && (
          <Typography variant='body2' sx={{ mt: 2 }}>
            Logged in as {user.email}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};
