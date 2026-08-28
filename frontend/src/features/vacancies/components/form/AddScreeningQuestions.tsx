import Stack from '@mui/material/Stack';
import type { VacancyQuestionInput } from '@/types';
import Typography from '@mui/material/Typography';
import { Alert, Box, Button, Chip, IconButton } from '@mui/material';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VacancyQuestionFields from './VacancyQuestionFields';
import {
  EMPTY_VACANCY_QUESTION,
  normalizeExpectedValue,
  validateVacancyQuestion,
} from '@/features/vacancies/model/vacancyQuestionForm';

interface ScreeningQuestionsProps {
  value: VacancyQuestionInput[];
  onChange: (form: VacancyQuestionInput[]) => void;
}

const AddScreeningQuestions = ({
  value,
  onChange,
}: ScreeningQuestionsProps) => {
  const [error, setError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<VacancyQuestionInput>(
    EMPTY_VACANCY_QUESTION,
  );

  // null -> the form adds a new question; a number -> it's editing value[index]
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const resetForm = () => {
    setCurrentQuestion(EMPTY_VACANCY_QUESTION);
    setEditingIndex(null);
    setError(null);
  };

  const handleAddQuestion = () => {
    const validationError = validateVacancyQuestion(currentQuestion);

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

    const validationError = validateVacancyQuestion(currentQuestion);
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
      <VacancyQuestionFields
        value={currentQuestion}
        onChange={setCurrentQuestion}
      />

      <Stack direction='row' spacing={1} sx={{ mt: 1, ml: 1 }}>
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
