import { useCreateQuestionMutation } from '@/features/questions/api/questionEndpoints';
import QuestionPicker from '@/features/questions/components/QuestionPicker';
import {
  useAddQuestionToVacancyMutation,
  useGetAllVacancyQuestionsQuery,
} from '@/features/vacancies/api/vacancyEndpoints';
import VacancyQuestionFields from '@/features/vacancies/components/form/VacancyQuestionFields';
import {
  EMPTY_VACANCY_QUESTION,
  normalizeExpectedValue,
  validateVacancyQuestion,
} from '@/features/vacancies/model/vacancyQuestionForm';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import type { Question, VacancyQuestionInput } from '@/types';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useState, type SubmitEvent } from 'react';
import { useParams } from 'react-router-dom';

/** Either an existing tenant question is reused, or a brand new one is created. */
type QuestionSource = 'existingQuestion' | 'newQuestion';

const AddQuestionToVacancy = () => {
  const { vacancyId } = useParams();

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<QuestionSource>('existingQuestion');

  const [existingQuestion, setExistingQuestion] = useState<Question | null>(
    null,
  );

  const [question, setQuestion] = useState<VacancyQuestionInput>(
    EMPTY_VACANCY_QUESTION,
  );

  const { data: vacancyQuestions = [] } = useGetAllVacancyQuestionsQuery(
    open && vacancyId ? vacancyId : skipToken,
  );

  const [
    createQuestion,
    { isLoading: isCreating, error: createQuestionError },
  ] = useCreateQuestionMutation();

  const [
    addQuestionToVacancy,
    { isLoading: isAdding, error: addQuestionToVacancyError },
  ] = useAddQuestionToVacancyMutation();

  const resetForm = () => {
    setExistingQuestion(null);
    setQuestion(EMPTY_VACANCY_QUESTION);
    setError(null);
    setSuccess(false);
  };

  const handleSourceChange = (next: QuestionSource | null) => {
    if (!next || next === source) return;

    setSource(next);
    resetForm();
  };

  const handlePickQuestion = (picked: Question | null) => {
    setExistingQuestion(picked);

    // Keep the vacancy-side answers already filled in, replace the definition.
    // expectedValue is dropped because it has to match the new type/options.
    setQuestion((current) => ({
      ...current,
      questionId: picked?.id,
      label: picked?.label ?? '',
      type: picked?.type,
      answerOptions: picked?.answerOptions ?? [],
      expectedValue: '',
    }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (!vacancyId)
      return setError('Vacancy ID is missing. Cannot add question to vacancy.');

    if (source === 'existingQuestion' && !existingQuestion)
      return setError('Please choose an existing question or switch to "New".');

    const { label, type, answerOptions, isRequired, priority, expectedValue } =
      normalizeExpectedValue(question);

    const validationError = validateVacancyQuestion(question);
    if (validationError || !type) return setError(validationError);

    try {
      const questionId =
        existingQuestion?.id ??
        (
          await createQuestion({
            body: {
              label: label.trim(),
              type,
              answerOptions: type === 'dropdown' ? answerOptions : undefined,
            },
          }).unwrap()
        ).id;

      await addQuestionToVacancy({
        vacancyId,
        questionId,
        body: { isRequired, priority, expectedValue },
      }).unwrap();

      resetForm();
      setSuccess(true);
    } catch (error: unknown) {
      const err = error as { data?: { error?: string; message?: string } };

      const backendError = err?.data?.error ?? 'Unknown Error';
      const backendMessage =
        err?.data?.message ??
        getErrorMessage(createQuestionError ?? addQuestionToVacancyError);

      setError(
        `Failed to add question. Error: ${backendError}. Message: ${backendMessage}. Please try again.`,
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        fullWidth
        maxWidth='sm'
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add Screening Question</DialogTitle>
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

            <ToggleButtonGroup
              exclusive
              size='small'
              value={source}
              onChange={(_event, next) =>
                handleSourceChange(next as QuestionSource | null)
              }
              sx={{ mb: 2 }}
            >
              <ToggleButton value='existingQuestion'>
                Existing question
              </ToggleButton>
              <ToggleButton value='newQuestion'>New question</ToggleButton>
            </ToggleButtonGroup>

            {source === 'existingQuestion' ? (
              <>
                <QuestionPicker
                  value={existingQuestion}
                  onChange={handlePickQuestion}
                  excludedIds={vacancyQuestions.map((q) => q.questionId)}
                />

                {existingQuestion && (
                  <VacancyQuestionFields
                    value={question}
                    onChange={setQuestion}
                    hideQuestionFields={true}
                  />
                )}
              </>
            ) : (
              <VacancyQuestionFields value={question} onChange={setQuestion} />
            )}
          </DialogContent>

          {/* Success Alert */}
          {success && (
            <Alert severity='success' sx={{ mb: 2 }}>
              Question added to the vacancy!
            </Alert>
          )}
          <DialogActions sx={{ marginBottom: '15px', marginRight: '20px' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type='submit'
              disabled={isCreating || isAdding}
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.light',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              {isCreating || isAdding ? 'Adding...' : 'Add Question'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Button variant='contained' onClick={() => setOpen(true)}>
        + Add Question
      </Button>
    </>
  );
};

export default AddQuestionToVacancy;
