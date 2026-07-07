import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { getErrorMessage } from '../../utils/errorMessage';
import { useCreateVacancyMutation } from '../api/api';
import { type CreateVacancyInput } from './types';
import VacancyForm from './VacancyForm';

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
    questions: 1,
    tags: 1,
    languages: 1,
    experience: 1,
    salary: 1,
  },
};

export const CreateVacancy = () => {
  const [open, setOpen] = useState(true);

  const [form, setForm] = useState<CreateVacancyInput>(EMPTY_VACANCY_FORM);

  const [createVacancy, { isLoading: isCreating, error: createVacancyError }] =
    useCreateVacancyMutation();

  const handleCreate = async () => {
    try {
      await createVacancy(form).unwrap();
      setOpen(false);
      alert('Vacancy created successfully!');
    } catch (error: any) {
      const backendError = error?.data?.error || 'Unknown Error';
      const backendMessage = error?.data?.message || 'No message provided';
      const alternativeMessage = getErrorMessage(createVacancyError);

      alert(
        `Failed to create vacancy: ${backendError} - ${backendMessage || alternativeMessage}`,
      );

      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleCreate}>
        <DialogTitle>Create Vacancy</DialogTitle>
        <DialogContent>
          <VacancyForm value={form} onChange={(next) => setForm(next)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Vacancy'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default CreateVacancy;
