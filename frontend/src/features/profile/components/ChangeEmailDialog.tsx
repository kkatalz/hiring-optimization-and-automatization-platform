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
import { useChangeEmailMutation } from '@/features/auth/api/authEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import type { Notification } from '@/types';

interface ChangeEmailDialogProps {
  userId: string;
  currentEmail: string;
  open: boolean;
  onClose: () => void;
  onNotify: (message: string, severity: Notification['severity']) => void;
}

const ChangeEmailDialog = ({
  userId,
  currentEmail,
  open,
  onClose,
  onNotify,
}: ChangeEmailDialogProps) => {
  const [email, setEmail] = useState('');

  const [changeEmail, { isLoading, error, reset }] = useChangeEmailMutation();

  const handleClose = () => {
    onClose();
    setEmail('');
    reset();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await changeEmail({ userId, email: email.trim() }).unwrap();
      onNotify('Your email has been updated.', 'success');
      handleClose();
    } catch {
      // The error is rendered inside the dialog, so it stays open for a retry
    }
  };

  const isUnchanged = email.trim().toLowerCase() === currentEmail.toLowerCase();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Change email</DialogTitle>

        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <DialogContentText>
            You sign in with this address. It has to stay unique across the
            platform.
          </DialogContentText>

          {error && <Alert severity='error'>{getErrorMessage(error)}</Alert>}

          <TextField
            label='Current email'
            size='small'
            fullWidth
            disabled
            value={currentEmail}
          />

          <TextField
            name='email'
            label='New email'
            type='email'
            size='small'
            required
            autoFocus
            fullWidth
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading || !email.trim() || isUnchanged}
          >
            {isLoading ? 'Saving…' : 'Save email'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangeEmailDialog;
