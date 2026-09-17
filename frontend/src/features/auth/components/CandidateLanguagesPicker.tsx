import { useBrowseVacanciesLanguagesCodesQuery } from '@/features/vacancies/api/vacancyEndpoints';
import { formatLanguage } from '@/shared/lib/formatText';
import {
  LANGUAGE_CODE_HINT,
  isValidLanguageCode,
  normalizeLanguageCode,
} from '@/shared/lib/validateLanguageCode';
import {
  ALL_LANGUAGE_LEVELS,
  type CandidateLanguageProficiency,
  type LanguageLevel,
} from '@/types';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

interface CandidateLanguagesPickerProps {
  value: CandidateLanguageProficiency[];
  onChange: (next: CandidateLanguageProficiency[]) => void;
}

/** Collects the languages a candidate knows. */
const CandidateLanguagesPicker = ({
  value,
  onChange,
}: CandidateLanguagesPickerProps) => {
  // The public list of codes already used by open vacancies.
  // If the list fails to load, the field remains free to type into.
  const { data: knownCodes } = useBrowseVacanciesLanguagesCodesQuery();

  const [code, setCode] = useState('');
  const [level, setLevel] = useState<LanguageLevel | ''>('');

  const takenCodes = value.map((language) =>
    normalizeLanguageCode(language.code),
  );
  const availableCodes = (knownCodes ?? []).filter(
    (known) => !takenCodes.includes(normalizeLanguageCode(known)),
  );

  const normalizedCode = normalizeLanguageCode(code);
  const isDuplicate = takenCodes.includes(normalizedCode);

  // the person typed something, and that something is not a language
  const isMalformed =
    normalizedCode !== '' && !isValidLanguageCode(normalizedCode);
  const canAdd =
    normalizedCode !== '' && level !== '' && !isDuplicate && !isMalformed;

  const codeError = isDuplicate
    ? 'Already added.'
    : isMalformed
      ? LANGUAGE_CODE_HINT
      : ' ';

  const handleAdd = () => {
    if (!canAdd) return;

    onChange([...value, { code: normalizedCode, level }]);
    setCode('');
    setLevel('');
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_language, index) => index !== indexToRemove));
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant='subtitle2'>Languages</Typography>

      {value.length > 0 && (
        <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {value.map((language, index) => (
            <Chip
              key={language.code.toLowerCase()}
              label={`${formatLanguage(language.code)} · ${language.level}`}
              onDelete={() => handleRemove(index)}
              color='primary'
              variant='outlined'
            />
          ))}
        </Stack>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Autocomplete
          freeSolo
          sx={{ flex: 1 }}
          options={availableCodes}
          inputValue={code}
          onInputChange={(_event, nextCode) => setCode(nextCode)}
          getOptionLabel={(option) => formatLanguage(option)}
          renderInput={(params) => (
            <TextField
              {...params}
              size='small'
              label='Language'
              type='text'
              placeholder='e.g. english'
              error={isDuplicate || isMalformed}
              helperText={codeError}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                handleAdd();
              }}
            />
          )}
        />

        <FormControl size='small' sx={{ minWidth: { xs: 0, sm: 140 } }}>
          <InputLabel id='candidate-language-level'>Level</InputLabel>
          <Select
            labelId='candidate-language-level'
            label='Level'
            value={level}
            onChange={(event) => setLevel(event.target.value as LanguageLevel)}
          >
            {ALL_LANGUAGE_LEVELS.map((languageLevel) => (
              <MenuItem key={languageLevel} value={languageLevel}>
                {languageLevel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type='button'
          variant='outlined'
          onClick={handleAdd}
          disabled={!canAdd}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, height: 40 }}
        >
          + Add
        </Button>
      </Stack>

      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        Languages are one of the five things a vacancy scores you on, so adding
        them here makes your match scores meaningful. Pick a code or type your
        own, choose a level, then Add.
      </Typography>
    </Stack>
  );
};

export default CandidateLanguagesPicker;
