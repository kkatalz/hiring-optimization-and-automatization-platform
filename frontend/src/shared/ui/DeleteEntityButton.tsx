import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useState } from 'react';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import { capitalizeName } from '@/shared/lib/formatText';

type DeleteEntityButtonProps = {
  entityLabel: string;
  onDelete: () => Promise<unknown>;
  isLoading: boolean;
  onNotify: (message: string, severity: 'success' | 'error') => void;
  variant?: 'button' | 'icon';
  sx?: SxProps<Theme>;
};

const DeleteEntityButton = ({
  entityLabel,
  onDelete,
  isLoading,
  onNotify,
  variant = 'button',
  sx,
}: DeleteEntityButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isLoading) {
      setDialogOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete();
      onNotify(
        `${capitalizeName(entityLabel)} deleted successfully!`,
        'success',
      );
      setDialogOpen(false);
    } catch (error) {
      const message = getErrorMessage(
        error as FetchBaseQueryError | SerializedError,
      );
      onNotify(`Failed to delete ${entityLabel}: ${message}`, 'error');
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <IconButton
          onClick={handleOpenDialog}
          disabled={isLoading}
          aria-label={`Delete ${entityLabel}`}
          sx={sx}
        >
          <DeleteForeverIcon />
        </IconButton>
      ) : (
        <Button
          variant='outlined'
          onClick={handleOpenDialog}
          disabled={isLoading}
          color='error'
          sx={sx}
        >
          Delete
        </Button>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
        role='alertdialog'
      >
        <DialogTitle id='delete-dialog-title'>
          Delete {capitalizeName(entityLabel)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete this {entityLabel}? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            disabled={isLoading}
            autoFocus
            sx={{ color: 'text.primary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteEntityButton;
