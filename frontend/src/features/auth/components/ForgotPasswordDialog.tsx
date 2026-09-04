import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useForgotPasswordMutation } from '@/features/auth/api/authEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordDialog = ({ open, onClose }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState('');

  const [forgotPassword, { data, isLoading, error, reset }] =
    useForgotPasswordMutation();

  const handleClose = () => {
    onClose();
    setEmail('');
    reset();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await forgotPassword({ email: email.trim() });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Reset your password</DialogTitle>

        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {data ? (
            <Alert severity='success'>{data.message}</Alert>
          ) : (
            <>
              <DialogContentText>
                Enter the email you sign in with and we will send you a link to
                set a new password. The link expires in 30 minutes.
              </DialogContentText>

              {error && (
                <Alert severity='error'>{getErrorMessage(error)}</Alert>
              )}

              <TextField
                name='email'
                label='Email'
                type='email'
                size='small'
                required
                autoFocus
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>{data ? 'Close' : 'Cancel'}</Button>
          {!data && (
            <Button
              type='submit'
              variant='contained'
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? 'Sending…' : 'Send link'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
