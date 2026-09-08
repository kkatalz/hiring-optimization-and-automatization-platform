import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useState, type SubmitEvent } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetPublicVacancyQuestionsQuery } from '@/features/vacancies/api/vacancyEndpoints';
import {
  useApplyToVacancyMutation,
  useUploadSubmissionResumeMutation,
} from '@/features/vacancySubmissions/api/vacancySubmissionEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import ScreeningQuestionsAnswers, {
  type AnswersByQuestionId,
} from './ScreeningQuestionsAnswers';
import type { CreateSubmissionInput, QuestionAnswer } from '@/types';

/** Matches the 5MB cap of the backend's UploadResume() interceptor. */
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ACCEPTED_RESUME_TYPES = '.pdf,.docx';

/** True when the candidate has put something in the field. */
const fieldHasAnswer = (value: string | string[] | undefined): boolean =>
  Array.isArray(value) ? value.length > 0 : !!value?.trim();

interface Props {
  vacancyId: string;
  vacancyName: string;
  /** Tags the vacancy asks for. At least one of them has to be picked. These are not shown to the candidate purposefully. */
  vacancyTags?: string[];
}

const ApplyToVacancyDialog = ({
  vacancyId,
  vacancyName,
  vacancyTags,
}: Props) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const [answers, setAnswers] = useState<AnswersByQuestionId>({});
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { data: questions, isLoading: isLoadingQuestions } =
    useGetPublicVacancyQuestionsQuery(open ? vacancyId : skipToken);

  const [applyToVacancy, { isLoading: isApplying }] =
    useApplyToVacancyMutation();
  const [uploadResume, { isLoading: isUploading }] =
    useUploadSubmissionResumeMutation();

  const isSubmitting = isApplying || isUploading;

  /**
   * Mirrors the backend's own checks, so the candidate learns what is missing
   * without a round trip. The backend still enforces all of it.
   */
  const validate = (): string | null => {
    const unanswered = (questions ?? [])
      .filter((question) => question.isRequired)
      .filter((question) => !fieldHasAnswer(answers[question.questionId]));

    if (unanswered.length)
      return `Please answer every required question: ${unanswered
        .map((question) => question.label)
        .join(', ')}.`;

    if (vacancyTags?.length && !tags.some((tag) => vacancyTags.includes(tag)))
      return `Pick at least one of the tags this vacancy asks for: ${vacancyTags.join(
        ', ',
      )}. If you don't have any of those skills, this vacancy is not a good fit for you.`;

    if (resumeFile && resumeFile.size > MAX_RESUME_BYTES)
      return 'That resume file is larger than 5MB.';

    return null;
  };

  const resetForm = () => {
    setAnswers({});
    setTags([]);
    setComment('');
    setExpectedSalary('');
    setResumeFile(null);
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) return setError(validationError);

    // Blank fields are left out rather than sent as empty strings, which the
    // backend would store as a real answer.
    const answeredQuestions: QuestionAnswer[] = Object.entries(answers)
      .filter(([, value]) => fieldHasAnswer(value))
      .map(([questionId, value]) => ({ questionId, value }));

    const body: CreateSubmissionInput = {
      comment: comment.trim() || undefined,
      tags: tags.length ? tags : undefined,
      answers: answeredQuestions.length ? answeredQuestions : undefined,
      expectedSalary:
        expectedSalary === '' ? undefined : Number(expectedSalary),
    };

    try {
      const submission = await applyToVacancy({ vacancyId, body }).unwrap();

      // The resume is a second call: the backend parses the file into the
      // submission's resume text, so the submission has to exist first.
      if (resumeFile)
        await uploadResume({
          submissionId: submission.id,
          file: resumeFile,
        }).unwrap();

      setApplied(true);
      setOpen(false);
      resetForm();
    } catch (submitError: unknown) {
      setError(
        getErrorMessage(submitError as Parameters<typeof getErrorMessage>[0]),
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  if (applied) return <Alert severity='success'>Application sent</Alert>;

  return (
    <>
      <Button variant='contained' onClick={() => setOpen(true)}>
        Apply
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        fullWidth
        maxWidth='sm'
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Apply to {vacancyName}</DialogTitle>

          <DialogContent>
            {error && (
              <Alert
                severity='error'
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Stack spacing={3} sx={{ pt: 1 }}>
              <Stack spacing={1}>
                <Typography variant='subtitle2'>
                  Your skills
                  {vacancyTags?.length ? (
                    <Typography component='span' color='error.main'>
                      {' *'}
                    </Typography>
                  ) : null}
                </Typography>

                {vacancyTags?.length ? (
                  <Typography variant='body2' color='text.secondary'>
                    This vacancy asks for {vacancyTags.join(', ')}. Pick at
                    least one, and add any others you have.
                  </Typography>
                ) : null}

                <Autocomplete
                  multiple
                  freeSolo
                  options={vacancyTags ?? []}
                  value={tags}
                  onChange={(_event, next) => setTags(next)}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='e.g. React, then press Enter'
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
              </Stack>

              <TextField
                label='Expected salary'
                placeholder='3000'
                slotProps={{ inputLabel: { shrink: true } }}
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                sx={{ maxWidth: { sm: 200 } }}
              />

              <TextField
                label='Cover note'
                placeholder='Why you are a good fit'
                slotProps={{ inputLabel: { shrink: true } }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                multiline
                minRows={3}
                fullWidth
              />

              <Stack spacing={1}>
                <Typography variant='subtitle2'>Resume</Typography>

                <Stack
                  direction='row'
                  sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
                >
                  <Button
                    component='label'
                    variant='outlined'
                    startIcon={<UploadFileIcon />}
                  >
                    Choose file
                    <input
                      hidden
                      type='file'
                      accept={ACCEPTED_RESUME_TYPES}
                      onChange={(e) =>
                        setResumeFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </Button>

                  {resumeFile ? (
                    <Chip
                      label={resumeFile.name}
                      onDelete={() => setResumeFile(null)}
                      size='small'
                    />
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      PDF or DOCX, up to 5MB. Optional.
                    </Typography>
                  )}
                </Stack>
              </Stack>

              {(isLoadingQuestions || questions?.length) && (
                <>
                  <Divider />
                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    Screening questions
                  </Typography>
                </>
              )}

              {isLoadingQuestions && (
                <Skeleton variant='rounded' height={120} />
              )}

              {questions?.length ? (
                <ScreeningQuestionsAnswers
                  questions={questions}
                  value={answers}
                  onChange={setAnswers}
                />
              ) : null}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type='submit' variant='contained' disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send application'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ApplyToVacancyDialog;
