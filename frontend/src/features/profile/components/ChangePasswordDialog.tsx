import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useChangePasswordMutation } from '@/features/auth/api/authEndpoints';
import {
  PASSWORD_MIN_LENGTH,
  validateNewPassword,
} from '@/features/auth/model/passwordPolicy';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import type { Notification } from '@/types';

interface ChangePasswordDialogProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onNotify: (message: string, severity: Notification['severity']) => void;
}

/**
 * Changing your own password, which the backend only allows against the current
 * one - that is what stops a hijacked session from locking the owner out.
 */
const ChangePasswordDialog = ({
  userId,
  open,
  onClose,
  onNotify,
}: ChangePasswordDialogProps) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [changePassword, { isLoading, error, reset }] =
    useChangePasswordMutation();

  const handleClose = () => {
    onClose();
    setOldPassword('');
    setPassword('');
    setConfirmation('');
    setValidationError(null);
    reset();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const reason = validateNewPassword(password, confirmation);
    setValidationError(reason);
    if (reason) return;

    try {
      await changePassword({ userId, oldPassword, password }).unwrap();
      onNotify('Your password has been updated.', 'success');
      handleClose();
    } catch {
      // The error is rendered inside the dialog, so it stays open for a retry
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Change password</DialogTitle>

        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {error && <Alert severity='error'>{getErrorMessage(error)}</Alert>}
          {validationError && (
            <Alert severity='warning'>{validationError}</Alert>
          )}

          <TextField
            name='oldPassword'
            label='Current password'
            type='password'
            size='small'
            required
            autoFocus
            fullWidth
            autoComplete='current-password'
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
          />

          <TextField
            name='password'
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
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isLoading || !oldPassword || !password || !confirmation}
          >
            {isLoading ? 'Saving…' : 'Save password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangePasswordDialog;
