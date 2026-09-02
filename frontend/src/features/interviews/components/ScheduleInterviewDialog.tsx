import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useState, type SubmitEvent } from 'react';
import { useHasPermission } from '@/features/auth/model/useHasPermission';
import { useScheduleInterviewMutation } from '@/features/interviews/api/interviewEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import { toDateTimeLocalValue } from '@/shared/lib/formatDate';
import type { CreateInterviewInput, NotifyHandler } from '@/types';

const NOTES_MAX_LENGTH = 2000;

interface InterviewForm {
  meetLink: string;
  scheduledDate: string;
  durationMinutes: string;
  interviewersEmails: string[];
  notes: string;
}

const EMPTY_INTERVIEW_FORM: InterviewForm = {
  meetLink: '',
  scheduledDate: '',
  durationMinutes: '',
  interviewersEmails: [],
  notes: '',
};

interface ScheduleInterviewDialogProps {
  submissionId: string;
  onNotify: NotifyHandler;
}

const ScheduleInterviewDialog = ({
  submissionId,
  onNotify,
}: ScheduleInterviewDialogProps) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const can = useHasPermission();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<InterviewForm>(EMPTY_INTERVIEW_FORM);

  const [scheduleInterview, { isLoading: isScheduling }] =
    useScheduleInterviewMutation();

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleSchedule = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const createInterviewDto: CreateInterviewInput = {
      submissionId,
      meetLink: form.meetLink.trim(),
      scheduledDate: new Date(form.scheduledDate).toISOString(),
    };

    // Optional fields are omitted entirely so the backend applies its defaults
    if (form.durationMinutes)
      createInterviewDto.durationMinutes = Number(form.durationMinutes);
    if (form.interviewersEmails.length)
      createInterviewDto.interviewersEmails = form.interviewersEmails;
    if (form.notes.trim()) createInterviewDto.notes = form.notes.trim();

    try {
      await scheduleInterview(createInterviewDto).unwrap();

      setForm(EMPTY_INTERVIEW_FORM);
      setOpen(false);
      onNotify(
        'Interview scheduled. An invitation was emailed to the attendees.',
        'success',
      );
    } catch (error) {
      const message = getErrorMessage(
        error as FetchBaseQueryError | SerializedError,
      );
      setError(`Failed to schedule the interview: ${message}`);
    }
  };

  if (!can('interview:schedule')) return null;

  return (
    <>
      <Button
        variant='contained'
        color='success'
        startIcon={<EventAvailableIcon />}
        onClick={() => setOpen(true)}
      >
        Schedule interview
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        fullWidth
        maxWidth='sm'
      >
        <form onSubmit={handleSchedule}>
          <DialogTitle>Schedule interview</DialogTitle>

          <DialogContent sx={{ margin: '2px 6px' }}>
            {error && (
              <Alert
                severity='error'
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Stack direction='column' sx={{ gap: '20px', mt: 2 }}>
              <TextField
                required
                type='url'
                label='Meeting link'
                placeholder='https://meet.google.com/abc-defg-hij'
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.meetLink}
                onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
              />

              <Stack direction='row' spacing={2}>
                <TextField
                  required
                  fullWidth
                  type='datetime-local'
                  label='Date and time'
                  slotProps={{
                    inputLabel: { shrink: true },
                    // The backend rejects past dates, so the picker blocks them too
                    htmlInput: { min: toDateTimeLocalValue(new Date()) },
                  }}
                  value={form.scheduledDate}
                  onChange={(e) =>
                    setForm({ ...form, scheduledDate: e.target.value })
                  }
                />

                <TextField
                  type='number'
                  label='Duration (minutes)'
                  placeholder='60'
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: 1, step: 5 },
                  }}
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: e.target.value })
                  }
                />
              </Stack>

              <Stack spacing={0.6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[] as string[]}
                  value={form.interviewersEmails}
                  onChange={(_event, newValue) =>
                    setForm({ ...form, interviewersEmails: newValue })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Interviewers'
                      placeholder='interviewer@company.com'
                      slotProps={{
                        ...params.slotProps,
                        inputLabel: {
                          ...params.slotProps?.inputLabel,
                          shrink: true,
                        },
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-tag': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                    },
                    '& .MuiAutocomplete-tag .MuiChip-deleteIcon': {
                      color: 'primary.main',
                    },
                  }}
                />
                <Typography
                  variant='subtitle2'
                  sx={{ color: 'text.secondary' }}
                >
                  Type an email and press Enter. The candidate is invited
                  automatically.
                </Typography>
              </Stack>

              <TextField
                label='Notes'
                placeholder='e.g. Technical round, focus on React'
                multiline
                minRows={2}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { maxLength: NOTES_MAX_LENGTH },
                }}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ marginBottom: '15px', marginRight: '20px' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type='submit'
              variant='contained'
              color='success'
              disabled={isScheduling}
            >
              {isScheduling ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ScheduleInterviewDialog;
