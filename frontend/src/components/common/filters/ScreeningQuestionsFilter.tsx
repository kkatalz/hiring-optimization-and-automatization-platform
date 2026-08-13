import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { skipToken } from '@reduxjs/toolkit/query';
import { useState } from 'react';
import { useGetAllVacancyQuestionsQuery } from '../../../features/api/api';
import type { QuestionAnswer } from '../../../../types';

interface ScreeningQuestionsFilterProps {
  value: QuestionAnswer[];
  onChange: (next: QuestionAnswer[]) => void;
  vacancyId?: string;
}

const BOOLEAN_OPTIONS = ['true', 'false'];

const ScreeningQuestionsFilter = ({
  value,
  onChange,
  vacancyId,
}: ScreeningQuestionsFilterProps) => {
  const { data: questions } = useGetAllVacancyQuestionsQuery(
    vacancyId ?? skipToken,
  );

  const [questionId, setQuestionId] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);

  const selectedQuestion = questions?.find((q) => q.questionId === questionId);

  const isDropdown = selectedQuestion?.type === 'dropdown';
  const isText = selectedQuestion?.type === 'text';

  const answerOptions =
    selectedQuestion?.type === 'boolean'
      ? BOOLEAN_OPTIONS
      : (selectedQuestion?.answerOptions ?? []);

  // Hide the questions that are already added
  const addedQuestionIds = value.map((answer) => answer.questionId);
  const availableQuestions =
    questions?.filter((q) => !addedQuestionIds.includes(q.questionId)) ?? [];

  const getQuestionLabel = (id: string) =>
    questions?.find((q) => q.questionId === id)?.label ?? id;

  const resetForm = () => {
    setQuestionId('');
    setAnswers([]);
  };

  const handleAdd = () => {
    if (!questionId) return;

    onChange([
      ...value,
      {
        questionId,
        // Value can be udefined on purpose, meaning "any answer is acceptable", just answer the question.
        value: answers.length ? (isDropdown ? answers : answers[0]) : undefined,
      },
    ]);

    resetForm();
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_answer, index) => index !== indexToRemove));
  };

  return (
    <Stack spacing={1.5} sx={{ color: 'primary.main' }}>
      <Divider />
      <Typography sx={{ fontWeight: 'bold' }}>Screening questions</Typography>

      {/* Already added question/answer pairs */}
      {value.length > 0 && (
        <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {value.map((answer, index) => (
            <Chip
              key={`${answer.questionId}-${index}`}
              label={`${getQuestionLabel(answer.questionId)} · ${
                Array.isArray(answer.value)
                  ? answer.value.join(', ')
                  : (answer.value ?? 'any answer')
              }`}
              onDelete={() => handleRemove(index)}
              color='primary'
              variant='outlined'
            />
          ))}
        </Stack>
      )}

      <Stack direction='row' spacing={2}>
        <TextField
          select
          label='Question'
          sx={{ flex: 1, maxWidth: 500 }}
          value={questionId}
          onChange={(e) => {
            setQuestionId(e.target.value);
            // Answers belong to the previous question, so drop them.
            setAnswers([]);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        >
          {availableQuestions.map((q) => (
            <MenuItem key={q.questionId} value={q.questionId}>
              {q.label}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          multiple
          sx={{ flex: 1, maxWidth: 500 }}
          options={answerOptions}
          value={answers}
          disabled={!selectedQuestion || isText}
          filterSelectedOptions
          onChange={(_event, newValue) =>
            // newValue.slice(-1) takes the last value only, because we don't want to allow multiple answers for non-dropdown questions.
            setAnswers(isDropdown ? newValue : newValue.slice(-1))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label='Answer'
              placeholder={
                isText
                  ? 'filtering is not supported for text questions'
                  : 'any answer'
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
              slotProps={{
                ...params.slotProps,
                inputLabel: {
                  ...params.slotProps?.inputLabel,
                  shrink: true,
                },
              }}
            />
          )}
        />

        <Button
          type='button'
          variant='outlined'
          onClick={handleAdd}
          disabled={!questionId}
          sx={{
            backgroundColor: 'primary.light',
            '&.Mui-disabled': {
              color: 'primary.main',
            },
          }}
        >
          + Add
        </Button>
      </Stack>

      <Divider />
    </Stack>
  );
};

export default ScreeningQuestionsFilter;
