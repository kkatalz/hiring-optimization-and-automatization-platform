import { useDeleteVacancyMutation } from '@/features/vacancies/api/vacancyEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useState } from 'react';

type DeleteVacancyButtonProps = {
  vacancyId: string;
  onNotify: (message: string, severity: 'success' | 'error') => void;
};

const DeleteVacancyButton = ({
  vacancyId,
  onNotify,
}: DeleteVacancyButtonProps) => {
  const [deleteVacancy, { isLoading }] = useDeleteVacancyMutation();
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
      await deleteVacancy(vacancyId).unwrap();
      onNotify('Vacancy deleted successfully!', 'success');
      setDialogOpen(false);
    } catch (error) {
      const message = getErrorMessage(
        error as FetchBaseQueryError | SerializedError,
      );
      onNotify(`Failed to delete vacancy: ${message}`, 'error');
    }
  };

  return (
    <>
      <Button
        variant='outlined'
        onClick={handleOpenDialog}
        disabled={isLoading}
        color='error'
      >
        Delete
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
        role='alertdialog'
      >
        <DialogTitle id='delete-dialog-title'>Delete Vacancy</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete this vacancy? This action cannot be
            undone.
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

export default DeleteVacancyButton;
