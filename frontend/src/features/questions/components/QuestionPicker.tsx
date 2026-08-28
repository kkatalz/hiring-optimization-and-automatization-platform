import { useFindAllQuestionsQuery } from '@/features/questions/api/questionEndpoints';
import type { Question } from '@/types';
import {
  Autocomplete,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface QuestionPickerProps {
  value: Question | null;
  onChange: (question: Question | null) => void;
  /** These are the questions that are already linked to the vacancy: the backend rejects those with 409. So we exclude them. */
  excludedIds?: string[];
}

/** Picks one of the tenant's existing questions, so the same question can be
 * reused across vacancies instead of being created again. */
const QuestionPicker = ({
  value,
  onChange,
  excludedIds = [],
}: QuestionPickerProps) => {
  const {
    data: questions = [],
    isLoading,
    isError,
  } = useFindAllQuestionsQuery();

  const options = questions.filter(
    (question) => !excludedIds.includes(question.id),
  );

  const noOptionsText = isError
    ? 'Could not load questions'
    : questions.length === 0
      ? 'This tenant has no questions yet'
      : 'All existing questions are already added';

  return (
    <Autocomplete
      options={options}
      loading={isLoading}
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      noOptionsText={noOptionsText}
      loadingText='Loading questions...'
      renderOption={({ key, ...optionProps }, option) => (
        <Stack
          key={key}
          component='li'
          direction='row'
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          {...optionProps}
        >
          <Typography variant='body2'>{option.label}</Typography>
          <Chip
            label={option.type}
            size='small'
            variant='outlined'
            sx={{ bgcolor: '#eaeff1', border: 'none', fontWeight: 500 }}
          />
        </Stack>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label='Existing question'
          placeholder='search by label'
          slotProps={{
            ...params.slotProps,
            inputLabel: { ...params.slotProps.inputLabel, shrink: true },
          }}
        />
      )}
    />
  );
};

export default QuestionPicker;
