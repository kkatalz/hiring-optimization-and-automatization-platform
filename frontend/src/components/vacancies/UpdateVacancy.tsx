import { useState, type SubmitEvent } from 'react';
import {
  VacancyQuestionDetailedToQuestionInput,
  type UpdateVacancyInput,
} from '../../../types';
import {
  useGetAllVacancyQuestionsQuery,
  useUpdateVacancyMutation,
} from '../../features/api/vacancyApi';
import { getErrorMessage } from '../../utils/errorMessage';
import VacancyForm from './VacancyForm';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

const UpdateVacancyForm = ({
  vacancyId,
  initialData,
}: {
  vacancyId: string;
  initialData: UpdateVacancyInput;
}) => {
  const [open, setOpen] = useState(false);

  const {
    data: questions,
    isLoading,
    isError,
  } = useGetAllVacancyQuestionsQuery(vacancyId, { skip: !open });

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        {isError ? (
          <DialogContent>
            <Alert severity='error'>
              Failed to load screening questions. Please close and try again.
            </Alert>
          </DialogContent>
        ) : isLoading || !questions ? (
          <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </DialogContent>
        ) : (
          <UpdateVacancyDialog
            vacancyId={vacancyId}
            initialData={{
              ...initialData,
              vacancyQuestions: questions.map(
                VacancyQuestionDetailedToQuestionInput,
              ),
            }}
            onClose={() => setOpen(false)}
          />
        )}
      </Dialog>

      <Button variant='outlined' onClick={() => setOpen(true)}>
        Edit
      </Button>
    </>
  );
};

/**
 * Mounts only once the vacancy's questions have loaded, so 'form' is seeded
 * with the real questions on the first render instead of an empty array.
 */
const UpdateVacancyDialog = ({
  vacancyId,
  initialData,
  onClose,
}: {
  vacancyId: string;
  initialData: UpdateVacancyInput;
  onClose: () => void;
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [form, setForm] = useState<UpdateVacancyInput>(initialData);

  const [updateVacancy, { isLoading: isUpdating, error: updateVacancyError }] =
    useUpdateVacancyMutation();

  const handleUpdate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    try {
      await updateVacancy({ id: vacancyId, body: form }).unwrap();
      setSuccess(true);
    } catch (error: unknown) {
      const err = error as { data?: { error?: string; message?: string } };

      const backendError = err?.data?.error ?? 'Unknown Error';
      const backendMessage = err?.data?.message;
      const alternativeMessage = getErrorMessage(updateVacancyError);
      const message =
        backendMessage ?? alternativeMessage ?? 'No message provided';

      setError(
        `Failed to update vacancy. Error: ${backendError}. Message: ${message}. Please try again.`,
      );
    }
  };

  const handleClose = () => {
    onClose();
    setError(null);
  };

  return (
    <form onSubmit={handleUpdate}>
      <DialogTitle>Update Vacancy</DialogTitle>
      <DialogContent sx={{ margin: '2px 6px' }}>
        <VacancyForm
          value={form}
          onChange={(next) => setForm(next as UpdateVacancyInput)}
        />
      </DialogContent>

      {/* Success Alert */}
      {success && (
        <Alert severity='success' sx={{ mb: 2 }}>
          Vacancy updated successfully!
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <DialogActions sx={{ marginBottom: '15px', marginRight: '20px' }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          type='submit'
          disabled={isUpdating}
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.light',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
        >
          {isUpdating ? 'Updating...' : 'Update Vacancy'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default UpdateVacancyForm;
