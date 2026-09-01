import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
  type AutocompleteRenderInputParams,
} from '@mui/material';
import {
  QUESTION_TYPES,
  type QuestionType,
  type VacancyQuestionInput,
} from '@/types';
import {
  expectedValueToString,
  splitExpectedValues,
} from '@/features/vacancies/model/vacancyQuestionForm';

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

interface VacancyQuestionFieldsProps {
  value: VacancyQuestionInput;
  onChange: (question: VacancyQuestionInput) => void;
  hideQuestionFields?: boolean;
}

const VacancyQuestionFields = ({
  value,
  onChange,
  hideQuestionFields = false,
}: VacancyQuestionFieldsProps) => {
  const answerOptions = value.answerOptions ?? [];
  const expectedValueText = expectedValueToString(value.expectedValue);

  const selectedExpectedValues = splitExpectedValues(expectedValueText).filter(
    (expected) => answerOptions.includes(expected),
  );

  const patch = (changes: Partial<VacancyQuestionInput>) =>
    onChange({ ...value, ...changes });

  return (
    <>
      {!hideQuestionFields && (
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
            value={value.label}
            onChange={(e) => patch({ label: e.target.value })}
          />

          <TextField
            select
            label='Type'
            value={value.type ?? ''}
            onChange={(e) =>
              patch({ type: e.target.value as QuestionType, expectedValue: '' })
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
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: hideQuestionFields ? '1fr 1fr' : '1fr 1fr 1fr',
          gap: 2,
          mt: hideQuestionFields ? 2 : 0,
        }}
      >
        <TextField
          label='Priority'
          placeholder='1'
          type='number'
          slotProps={FLOATING_LABEL}
          value={value.priority ?? ''}
          onChange={(e) =>
            patch({
              priority:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        />

        {!hideQuestionFields && (
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={answerOptions}
            onChange={(_event, newValue) => patch({ answerOptions: newValue })}
            renderInput={(params) =>
              renderFieldInput(params, 'Answer options', 'dropdown only')
            }
          />
        )}

        {value.type === 'dropdown' ? (
          <Autocomplete
            multiple
            options={answerOptions}
            disabled={answerOptions.length === 0}
            value={selectedExpectedValues}
            onChange={(_event, newValue) => patch({ expectedValue: newValue })}
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
        ) : value.type === 'boolean' ? (
          <TextField
            select
            label='Expected value'
            value={expectedValueText}
            onChange={(e) => patch({ expectedValue: e.target.value })}
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
            onChange={(e) => patch({ expectedValue: e.target.value })}
          />
        )}
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            sx={{ padding: '0px' }}
            size='small'
            checked={value.isRequired}
            onChange={(e) => patch({ isRequired: e.target.checked ?? false })}
          />
        }
        label='Required'
        sx={{
          alignSelf: 'flex-start',
          width: 'fit-content',
          borderRadius: '10px',
          border: '1px solid #ccc',
          padding: '2px 6px',
          gap: '5px',
          mt: 1,
          ml: 1,
        }}
      />
    </>
  );
};

export default VacancyQuestionFields;
