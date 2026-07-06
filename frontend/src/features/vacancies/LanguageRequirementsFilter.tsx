import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import {
  ALL_LANGUAGE_LEVELS,
  type LanguageLevel,
  type LanguageProficiency,
} from '../filters/filterSlice';
import Divider from '@mui/material/Divider';

interface LanguageRequirementsFilterProps {
  value: LanguageProficiency[];
  onChange: (next: LanguageProficiency[]) => void;
  languageCodes: string[];
}

export const LanguageRequirementsFilter = ({
  value,
  onChange,
  languageCodes,
}: LanguageRequirementsFilterProps) => {
  const [code, setCode] = useState<string | null>(null);
  const [level, setLevel] = useState<LanguageLevel | ''>('');

  // Hide languages that are already added, so one language can't be added twice.
  const selectedCodes = value.map((pair) => pair.code);
  const availableCodes = languageCodes.filter(
    (c) => !selectedCodes.includes(c),
  );

  const canAdd = code !== null && level !== '';

  const handleAdd = () => {
    if (!canAdd) return;

    onChange([...value, { code, level }]);

    setCode(null);
    setLevel('');
  };

  const handleRemove = (codeToRemove: string) => {
    onChange(value.filter((pair) => pair.code !== codeToRemove));
  };

  return (
    <Stack spacing={1.5} sx={{ color: 'primary.main' }}>
      <Divider />
      <Typography variant='subtitle2'>Language requirements</Typography>

      {/* Already added pairs */}
      {value.length > 0 && (
        <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {value.map((pair) => (
            <Chip
              key={pair.code}
              label={`${pair.code.toUpperCase()} · ${pair.level}`}
              onDelete={() => handleRemove(pair.code)}
              color='primary'
              variant='outlined'
            />
          ))}
        </Stack>
      )}

      <Stack direction='row' spacing={2}>
        <Autocomplete
          sx={{ flex: 1 }}
          options={availableCodes}
          value={code}
          onChange={(_event, newCode) => setCode(newCode)}
          getOptionLabel={(code) => code.toUpperCase()}
          renderInput={(params) => (
            <TextField {...params} label='Language' placeholder='e.g. en' />
          )}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id='lang-level-label'>Level</InputLabel>
          <Select
            labelId='lang-level-label'
            label='Level'
            value={level}
            onChange={(e: SelectChangeEvent) =>
              setLevel(e.target.value as LanguageLevel)
            }
          >
            {ALL_LANGUAGE_LEVELS.map((lvl) => (
              <MenuItem key={lvl} value={lvl}>
                {lvl}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type='button'
          variant='outlined'
          onClick={handleAdd}
          disabled={!canAdd}
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
