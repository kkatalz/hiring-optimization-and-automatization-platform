import {
  Autocomplete,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { QuestionType } from '@/types';
import type { PublicVacancyQuestion } from '@/types';

/**
 * Answers keyed by question id. The shape mirrors what the backend accepts:
 * a string for boolean and text questions, an array for dropdowns.
 */
export type AnswersByQuestionId = Record<string, string | string[]>;

interface Props {
  questions: PublicVacancyQuestion[];
  value: AnswersByQuestionId;
  onChange: (next: AnswersByQuestionId) => void;
}

const ScreeningQuestionsAnswers = ({ questions, value, onChange }: Props) => {
  const setAnswer = (questionId: string, answer: string | string[]) =>
    onChange({ ...value, [questionId]: answer });

  return (
    <Stack spacing={2.5}>
      {questions.map((question) => (
        <Stack key={question.questionId} spacing={1}>
          <Typography variant='subtitle2'>
            {question.label}
            {question.isRequired && (
              <Typography component='span' color='error.main'>
                {' *'}
              </Typography>
            )}
          </Typography>

          {question.type === QuestionType.boolean && (
            // The backend wants the strings 'true' and 'false', not booleans
            <ToggleButtonGroup
              exclusive
              size='small'
              color='primary'
              value={value[question.questionId] ?? null}
              onChange={(_event, next: string | null) => {
                if (next !== null) setAnswer(question.questionId, next);
              }}
              aria-label={question.label}
            >
              <ToggleButton value='true'>Yes</ToggleButton>
              <ToggleButton value='false'>No</ToggleButton>
            </ToggleButtonGroup>
          )}

          {question.type === QuestionType.text && (
            <TextField
              multiline
              minRows={2}
              value={value[question.questionId] ?? ''}
              onChange={(e) => setAnswer(question.questionId, e.target.value)}
              placeholder='Your answer'
              fullWidth
            />
          )}

          {question.type === QuestionType.dropdown && (
            // Free text is rejected by the backend, so the options are the
            // only thing selectable here
            <Autocomplete
              multiple
              options={question.answerOptions ?? []}
              value={
                Array.isArray(value[question.questionId])
                  ? (value[question.questionId] as string[])
                  : []
              }
              onChange={(_event, next) => setAnswer(question.questionId, next)}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} placeholder='Choose an option' />
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
          )}
        </Stack>
      ))}
    </Stack>
  );
};

export default ScreeningQuestionsAnswers;
