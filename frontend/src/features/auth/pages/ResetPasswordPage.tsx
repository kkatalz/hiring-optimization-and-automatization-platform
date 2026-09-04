import {
  Alert,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useResetPasswordMutation } from '@/features/auth/api/authEndpoints';
import {
  PASSWORD_MIN_LENGTH,
  validateNewPassword,
} from '@/features/auth/model/passwordPolicy';
import { getErrorMessage } from '@/shared/lib/errorMessage';

/**
 * Where the emailed reset link lands: `/reset-password?token=...`.
 *
 * The token is the only credential here, so the page is public - the visitor
 * cannot sign in, which is the whole reason they are on it.
 */
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [resetPassword, { isSuccess, isLoading, error }] =
    useResetPasswordMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const reason = validateNewPassword(password, confirmation);
    setValidationError(reason);
    if (reason || !token) return;

    await resetPassword({ token, newPassword: password });
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
        sx={{ display: 'flex', flexDirection: 'column', p: 4, borderRadius: 2 }}
      >
        <Typography variant='h5'>Set a new password</Typography>

        {!token && (
          <Alert severity='error' sx={{ mt: 2 }}>
            This link is missing its reset token. Request a new link from the
            sign-in page.
          </Alert>
        )}

        {isSuccess ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity='success'>
              Your password has been changed. You can sign in with it now.
            </Alert>
            <Button variant='contained' onClick={() => navigate('/login')}>
              Go to sign in
            </Button>
          </Stack>
        ) : (
          <Stack
            component='form'
            onSubmit={handleSubmit}
            spacing={2}
            sx={{ width: '100%', mt: 2 }}
          >
            {error && <Alert severity='error'>{getErrorMessage(error)}</Alert>}
            {validationError && (
              <Alert severity='warning'>{validationError}</Alert>
            )}

            <TextField
              name='newPassword'
              label='New password'
              type='password'
              size='small'
              required
              fullWidth
              autoComplete='new-password'
              helperText={`At least ${PASSWORD_MIN_LENGTH} characters`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <TextField
              name='confirmPassword'
              label='Repeat new password'
              type='password'
              size='small'
              required
              fullWidth
              autoComplete='new-password'
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />

            <Button
              type='submit'
              variant='contained'
              disabled={isLoading || !token}
            >
              {isLoading ? 'Saving…' : 'Save password'}
            </Button>

            <Link
              component={RouterLink}
              to='/login'
              underline='hover'
              variant='body2'
              sx={{ alignSelf: 'center' }}
            >
              Back to sign in
            </Link>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
