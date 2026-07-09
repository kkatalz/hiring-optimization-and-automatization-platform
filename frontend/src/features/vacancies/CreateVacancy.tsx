import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState, type SubmitEvent } from 'react';
import { getErrorMessage } from '../../utils/errorMessage';
import { useCreateVacancyMutation } from '../api/api';
import { type CreateVacancyInput } from './types';
import VacancyForm from './VacancyForm';
import { Alert } from '@mui/material';

const EMPTY_VACANCY_FORM: CreateVacancyInput = {
  name: '',
  description: '',
  minSalary: undefined,
  maxSalary: undefined,
  timeCommitment: undefined,
  languageRequirements: [],
  requiredYearsOfExperience: undefined,
  tags: [],
  customWeights: {
    questions: undefined,
    tags: undefined,
    languages: undefined,
    experience: undefined,
    salary: undefined,
  },
  vacancyQuestions: [],
};

export const CreateVacancy = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [open, setOpen] = useState(true);

  const [form, setForm] = useState<CreateVacancyInput>(EMPTY_VACANCY_FORM);

  const [createVacancy, { isLoading: isCreating, error: createVacancyError }] =
    useCreateVacancyMutation();

  const handleCreate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    try {
      await createVacancy(form).unwrap();
      setSuccess(true);
      setForm(EMPTY_VACANCY_FORM);
    } catch (error: unknown) {
      const err = error as { data?: { error?: string; message?: string } };

      const backendError = err?.data?.error || 'Unknown Error';
      const backendMessage = err?.data?.message || 'No message provided';
      const alternativeMessage = getErrorMessage(createVacancyError);

      setError(
        `Failed to create vacancy. Error: ${backendError}. Message: ${backendMessage ?? alternativeMessage}. Please try again.`,
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleCreate}>
        <DialogTitle>Create Vacancy</DialogTitle>
        <DialogContent sx={{ margin: '2px 6px' }}>
          {/* Error Alert */}
          {error && (
            <Alert
              severity='error'
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <VacancyForm
            value={form}
            onChange={(next) => setForm(next as CreateVacancyInput)}
          />
        </DialogContent>

        {/* Success Alert */}
        {success && (
          <Alert severity='success' sx={{ mb: 2 }}>
            Vacancy created successfully!
          </Alert>
        )}
        <DialogActions sx={{ marginBottom: '15px', marginRight: '20px' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type='submit'
            disabled={isCreating}
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.light',
              '&:hover': { backgroundColor: 'primary.dark' },
            }}
          >
            {isCreating ? 'Creating...' : 'Create Vacancy'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default CreateVacancy;
