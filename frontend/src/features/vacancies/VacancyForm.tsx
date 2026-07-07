import TextField from '@mui/material/TextField';
import type { CreateVacancyInput } from './types';
import Autocomplete from '@mui/material/Autocomplete';
import {
  useGetAllVacanciesTagsQuery,
  useGetAllVacanciesLanguagesCodesQuery,
} from '../api/api';
import Stack from '@mui/material/Stack';
import { ALL_TIME_COMMITMENTS } from '../filters/filterSlice';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { LanguageRequirementsFilter } from './LanguageRequirementsFilter';

interface VacancyProps {
  value: CreateVacancyInput;
  onChange: (form: CreateVacancyInput) => void;
}

const VacancyForm = ({ value, onChange }: VacancyProps) => {
  const { data: allTags } = useGetAllVacanciesTagsQuery();
  const { data: languageCodes } = useGetAllVacanciesLanguagesCodesQuery();

  return (
    <Stack direction='column' sx={{ display: 'flex', gap: '20px', mt: 2 }}>
      <TextField
        required
        label='Name'
        placeholder='e.g. React Developer'
        slotProps={{
          inputLabel: { shrink: true },
        }}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />

      <TextField
        required
        label='Description'
        placeholder='e.g. We are looking for a React Developer...'
        slotProps={{
          inputLabel: { shrink: true },
        }}
        multiline
        minRows={2}
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />

      <Stack direction='row' spacing={2}>
        <TextField
          label='Min salary'
          placeholder='3000'
          slotProps={{
            inputLabel: { shrink: true },
          }}
          value={value.minSalary ?? ''}
          onChange={(e) =>
            onChange({ ...value, minSalary: Number(e.target.value) })
          }
          type='number'
        />
        <TextField
          label='Max salary'
          placeholder='5000'
          slotProps={{
            inputLabel: { shrink: true },
          }}
          value={value.maxSalary ?? ''}
          onChange={(e) =>
            onChange({ ...value, maxSalary: Number(e.target.value) })
          }
          type='number'
        />
      </Stack>

      <Stack direction='row' spacing={2}>
        <TextField
          fullWidth
          sx={{ flex: 1 }}
          label='Required experience (yrs)'
          placeholder='5'
          slotProps={{
            inputLabel: { shrink: true },
          }}
          value={value.requiredYearsOfExperience ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              requiredYearsOfExperience: Number(e.target.value),
            })
          }
          type='number'
        />

        {/* Time Commitment */}
        <FormControl fullWidth sx={{ flex: 1 }}>
          <InputLabel id='lang-level-label' shrink>
            Time commitment
          </InputLabel>
          <Select
            labelId='time-commitment-select-label'
            id='time-commitment-select'
            value={value.timeCommitment || ''}
            label='Time commitment'
            onChange={(e) => {
              onChange({
                ...value,
                timeCommitment: e.target.value,
              });
            }}
            displayEmpty
            renderValue={(selected) => {
              if (!selected || selected.length === 0)
                return <span style={{ color: '#aaa' }}>Full time</span>;

              return selected.replace('_', ' ');
            }}
          >
            {ALL_TIME_COMMITMENTS.map((commitment) => (
              <MenuItem key={commitment} value={commitment}>
                {commitment.replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Tags */}
      <Stack spacing={0.6}>
        <Autocomplete
          multiple
          freeSolo
          id='tags-outlined'
          options={allTags || []}
          value={value.tags ?? []}
          getOptionLabel={(option) => option}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField
              {...params}
              label='Tags'
              placeholder='pick a tag or type a new one...'
              slotProps={{
                ...params.slotProps, // 1. Keep all Autocomplete internal mechanics intact
                inputLabel: {
                  ...params.slotProps?.inputLabel,
                  shrink: true, // 2. Add your shrink rule safely
                },
              }}
            />
          )}
          onChange={(_event, newValue) => {
            onChange({
              ...value,
              tags: newValue,
            });
          }}
          sx={{
            width: '100%',
            '& .MuiAutocomplete-tag': {
              backgroundColor: 'primary.light',
              color: 'primary.main',
            },
            // Target the delete/cancel icon
            '& .MuiAutocomplete-tag .MuiChip-deleteIcon': {
              color: 'primary.main',
            },
          }}
        />
        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
          Choose from existing tags, or type a brand-new one and press Enter.
        </Typography>
      </Stack>
      <Divider />

        <LanguageRequirementsFilter
          value={value.languageRequirements ?? []}
          onChange={(newValue) => {
            onChange({
              ...value,
              languageRequirements: newValue,
            });
          }}
          languageCodes={languageCodes ?? []}
          makeFreeSolo={true}
        />
    </Stack>
  );
};

export default VacancyForm;
