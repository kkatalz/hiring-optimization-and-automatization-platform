import Stack from '@mui/material/Stack';
import {
  QUESTION_TYPES,
  type QuestionType,
  type VacancyQuestionInput,
} from '../../../types';
import Typography from '@mui/material/Typography';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
  type AutocompleteRenderInputParams,
} from '@mui/material';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

interface ScreeningQuestionsProps {
  value: VacancyQuestionInput[];
  onChange: (form: VacancyQuestionInput[]) => void;
}

const EMPTY_QUESTION_FORM: VacancyQuestionInput = {
  label: '',
  priority: undefined,
  answerOptions: [],
  expectedValue: '',
  isRequired: false,
};

const FLOATING_LABEL = { inputLabel: { shrink: true } };

const renderFieldInput = (
  params: AutocompleteRenderInputParams,
  label: string,
  placeholder: string,
) => (
  <TextField
    {...params}
    label={label}
    placeholder={placeholder}
    slotProps={{
      ...params.slotProps,
      inputLabel: { ...params.slotProps.inputLabel, shrink: true },
    }}
  />
);

const expectedValueToString = (
  expectedValue: VacancyQuestionInput['expectedValue'],
): string =>
  Array.isArray(expectedValue)
    ? expectedValue.join(', ')
    : (expectedValue ?? '');

// Dropdowns can expect several accepted options, entered comma-separated.
const splitExpectedValues = (text: string): string[] =>
  text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean); // drop the empty ones

const normalizeExpectedValue = (
  question: VacancyQuestionInput,
): VacancyQuestionInput => {
  const text = expectedValueToString(question.expectedValue).trim();

  if (!text) return { ...question, expectedValue: undefined };

  if (question.type !== 'dropdown') return { ...question, expectedValue: text };

  // Drop anything no longer offered, e.g. an option removed after being picked.
  const answerOptions = question.answerOptions ?? [];
  const selected = splitExpectedValues(text).filter((expected) =>
    answerOptions.includes(expected),
  );

  return {
    ...question,
    expectedValue: selected.length > 0 ? selected : undefined,
  };
};

const AddScreeningQuestions = ({
  value,
  onChange,
}: ScreeningQuestionsProps) => {
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] =
    useState<VacancyQuestionInput>(EMPTY_QUESTION_FORM);

  // null -> the form adds a new question; a number -> it's editing value[index]
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const answerOptions = currentQuestion.answerOptions ?? [];
  const expectedValueText = expectedValueToString(
    currentQuestion.expectedValue,
  );

  const selectedExpectedValues = splitExpectedValues(expectedValueText).filter(
    (expected) => answerOptions.includes(expected),
  );

  const validateCurrentQuestion = (): string | null => {
    if (!currentQuestion.label?.trim())
      return 'No question was added. Please provide a question label.';

    if (!currentQuestion.type) return 'Please select a question type.';

    if (currentQuestion.type === 'dropdown' && answerOptions.length === 0)
      return 'Dropdown questions require at least one answer option.';

    return null;
  };

  const resetForm = () => {
    setCurrentQuestion(EMPTY_QUESTION_FORM);
    setEditingIndex(null);
    setError(null);
  };

  const handleAddQuestion = () => {
    const validationError = validateCurrentQuestion();

    if (validationError) {
      setError(validationError);
      return;
    }

    onChange([...value, normalizeExpectedValue(currentQuestion)]);
    resetForm();
  };

  const handleStartEdit = (indexToEdit: number) => {
    setCurrentQuestion(value[indexToEdit]);
    setEditingIndex(indexToEdit);
    setError(null);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const validationError = validateCurrentQuestion();
    if (validationError) {
      setError(validationError);
      return;
    }

    onChange(
      value.map((question, index) =>
        index === editingIndex
          ? normalizeExpectedValue(currentQuestion)
          : question,
      ),
    );
    resetForm();
  };

  const handleRemoveQuestion = (indexToRemove: number) => {
    // If the row being edited is removed, drop the in-progress edit too.
    if (editingIndex === indexToRemove) resetForm();
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const isEditing = editingIndex !== null;

  return (
    <Stack direction='column' sx={{ gap: '10px' }}>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction='row' spacing={1} sx={{ color: 'primary.main' }}>
        <Typography sx={{ fontWeight: 'bold' }}>Screening Questions</Typography>
        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
          (optional · vacancyQuestions)
        </Typography>
      </Stack>

      {/* Screening Questions Chips */}
      {value.map((question, index) => (
        <Box
          key={index}
          sx={{
            position: 'relative',
            gap: '10px',
            padding: '5px',
            border: '1px solid',
            borderColor: editingIndex === index ? 'primary.main' : '#ccc',
            borderRadius: '6px',
          }}
        >
          <Stack
            direction='row'
            spacing={0.5}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <IconButton size='small' onClick={() => handleStartEdit(index)}>
              <EditIcon fontSize='small' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => handleRemoveQuestion(index)}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Stack>

          <Typography
            key={index}
            variant='subtitle2'
            gutterBottom
            sx={{ fontWeight: 600, mb: 1, ml: 2, pr: 9 }}
          >
            {index + 1}. {question.label}
          </Typography>

          <Stack direction='row' spacing={1} sx={{ ml: 2 }}>
            {question.type && (
              <Chip
                label={question.type}
                size='small'
                variant='outlined'
                sx={{ bgcolor: '#eaeff1', border: 'none', fontWeight: 500 }}
              />
            )}
            {question.isRequired && (
              <Chip
                label={question.isRequired ? 'required' : 'optional'}
                size='small'
                sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 500 }}
              />
            )}
            {question.priority && (
              <Chip
                label={`priority ${question.priority}`}
                size='small'
                variant='outlined'
                sx={{ fontWeight: 500 }}
              />
            )}
          </Stack>
        </Box>
      ))}

      {/* Add Question Form */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 2,
          mb: 2,
          mt: 1,
        }}
      >
        <TextField
          label='Question label'
          placeholder='e.g. How many years with React?'
          slotProps={FLOATING_LABEL}
          value={currentQuestion.label}
          onChange={(e) =>
            setCurrentQuestion({ ...currentQuestion, label: e.target.value })
          }
        />

        <TextField
          select
          label='Type'
          value={currentQuestion.type ?? ''}
          onChange={(e) =>
            setCurrentQuestion({
              ...currentQuestion,
              type: e.target.value as QuestionType,
              expectedValue: '',
            })
          }
          slotProps={{
            ...FLOATING_LABEL,
            select: {
              displayEmpty: true,
              renderValue: (selected) =>
                (selected as string) || (
                  <span style={{ color: '#aaa' }}>text</span>
                ),
            },
          }}
        >
          {QUESTION_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
        <TextField
          label='Priority'
          placeholder='1'
          type='number'
          slotProps={FLOATING_LABEL}
          value={currentQuestion.priority ?? ''}
          onChange={(e) =>
            setCurrentQuestion({
              ...currentQuestion,
              priority:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        />

        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={answerOptions}
          onChange={(_event, newValue) =>
            setCurrentQuestion({ ...currentQuestion, answerOptions: newValue })
          }
          renderInput={(params) =>
            renderFieldInput(params, 'Answer options', 'dropdown only')
          }
        />
        {currentQuestion.type === 'dropdown' ? (
          <Autocomplete
            multiple
            options={answerOptions}
            disabled={answerOptions.length === 0}
            value={selectedExpectedValues}
            onChange={(_event, newValue) =>
              setCurrentQuestion({
                ...currentQuestion,
                expectedValue: newValue,
              })
            }
            renderInput={(params) =>
              renderFieldInput(
                params,
                'Expected value',
                answerOptions.length === 0
                  ? 'add answer options first'
                  : 'any answer',
              )
            }
          />
        ) : currentQuestion.type === 'boolean' ? (
          <TextField
            select
            label='Expected value'
            value={expectedValueText}
            onChange={(e) =>
              setCurrentQuestion({
                ...currentQuestion,
                expectedValue: e.target.value,
              })
            }
            slotProps={{
              ...FLOATING_LABEL,
              select: {
                displayEmpty: true,
                renderValue: (selected) =>
                  (selected as string) || (
                    <span style={{ color: '#aaa' }}>any answer</span>
                  ),
              },
            }}
          >
            <MenuItem value='true'>true</MenuItem>
            <MenuItem value='false'>false</MenuItem>
          </TextField>
        ) : (
          <TextField
            label='Expected value'
            placeholder='e.g. 5'
            slotProps={FLOATING_LABEL}
            value={expectedValueText}
            onChange={(e) =>
              setCurrentQuestion({
                ...currentQuestion,
                expectedValue: e.target.value,
              })
            }
          />
        )}
      </Box>

      <Stack direction='row' spacing={1} sx={{ mt: 1, ml: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              sx={{ padding: '0px' }}
              size='small'
              checked={currentQuestion.isRequired}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  isRequired: e.target.checked ?? false,
                })
              }
            />
          }
          label='Required'
          sx={{
            borderRadius: '10px',
            border: '1px solid #ccc',
            padding: '2px 6px',
            gap: '5px',
          }}
        ></FormControlLabel>
        <Button
          variant='outlined'
          onClick={isEditing ? handleSaveEdit : handleAddQuestion}
          color='success'
          sx={{ textTransform: 'uppercase' }}
        >
          {isEditing ? 'Save changes' : '+ Add Question'}
        </Button>
        {isEditing && (
          <Button
            variant='outlined'
            onClick={resetForm}
            color='inherit'
            sx={{ textTransform: 'uppercase' }}
          >
            Cancel
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default AddScreeningQuestions;
