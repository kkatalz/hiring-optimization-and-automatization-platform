import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  ALL_TIME_COMMITMENTS,
  applyFilters,
  initialState,
  resetFilters,
  setOrder,
  setSortBy,
  type SortColumn,
  type SortOrder,
} from '../filters/filterSlice';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import {
  useGetAllVacanciesTagsQuery,
  useGetAllVacanciesLanguagesCodesQuery,
} from '../api/api';
import { LanguageRequirementsFilter } from './LanguageRequirementsFilter';

export const FiltersComponent = () => {
  const dispatch = useAppDispatch();

  const appliedFilters = useAppSelector((state) => state.filters);
  const [draft, setDraft] = useState(appliedFilters);

  const { data: allTags } = useGetAllVacanciesTagsQuery();
  const { data: languageCodes } = useGetAllVacanciesLanguagesCodesQuery();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(applyFilters(draft));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setDraft({ ...initialState });
  };

  return (
    <Paper elevation={3} sx={{ padding: '20px', maxWidth: '600px' }}>
      <Stack
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', gap: '20px' }}
      >
        <Stack direction='row' spacing={2}>
          <TextField
            label='Name'
            placeholder='e.g. React Developer'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <TextField
            label='Min salary'
            placeholder='0'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.minSalary ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                minSalary:
                  e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />
          <TextField
            label='Max salary'
            placeholder='5000'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.maxSalary ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                maxSalary:
                  e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />
        </Stack>

        <Stack direction='row' spacing={2}>
          <TextField
            label='Min experience (yrs)'
            placeholder='0'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.minRequiredExperience ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                minRequiredExperience:
                  e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />
          <TextField
            label='Max experience (yrs)'
            placeholder='10'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.maxRequiredExperience ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                maxRequiredExperience:
                  e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />

          {/* Tags */}
          <Autocomplete
            multiple
            id='tags-outlined'
            options={allTags || []}
            value={draft.tags}
            getOptionLabel={(option) => option}
            filterSelectedOptions
            renderInput={(params) => <TextField {...params} label='Tags' />}
            onChange={(_event, newValue) => {
              setDraft({
                ...draft,
                tags: newValue.map((option) => option),
              });
            }}
            sx={{
              maxWidth: 230,
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
        </Stack>

        <Stack direction='row' spacing={2}>
          {/* Time Commitment */}
          <Autocomplete
            multiple
            id='time-commitment-outlined'
            options={ALL_TIME_COMMITMENTS}
            value={draft.timeCommitment || []}
            getOptionLabel={(option) => option.replace('_', ' ')} // renders "FULL TIME" beautifully
            filterSelectedOptions
            renderInput={(params) => (
              <TextField {...params} label='Time commitment' />
            )}
            onChange={(_event, newValue) => {
              setDraft({
                ...draft,
                timeCommitment: newValue,
              });
            }}
            sx={{
              minWidth: 200,
              maxWidth: 230,
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

          {/* Limit */}
          <TextField
            label='Limit'
            value={draft.limit}
            onChange={(e) =>
              setDraft({ ...draft, limit: Number(e.target.value) })
            }
            sx={{ maxWidth: 100 }}
          />
        </Stack>

        {/* Language requirements */}
        <LanguageRequirementsFilter
          value={draft.languageRequirements ?? []}
          onChange={(next) =>
            setDraft({ ...draft, languageRequirements: next })
          }
          languageCodes={languageCodes ?? []}
        />

        <Stack direction='row' spacing={2}>
          {/* Sorting */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id='sortby-label'>Sort by</InputLabel>
            <Select
              labelId='sortby-label'
              value={appliedFilters.sortBy ?? ''}
              onChange={(e: SelectChangeEvent) =>
                dispatch(setSortBy(e.target.value as SortColumn))
              }
            >
              <MenuItem value='createdAt'>Created at</MenuItem>
              <MenuItem value='requiredYearsOfExperience'>
                Required experience
              </MenuItem>
              <MenuItem value='minSalary'>Minimum salary</MenuItem>
              <MenuItem value='maxSalary'>Maximum salary</MenuItem>
            </Select>
          </FormControl>

          {/* Order */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id='order-label'>Order</InputLabel>
            <Select
              labelId='order-label'
              value={appliedFilters.order ?? ''}
              disabled={!appliedFilters.sortBy}
              onChange={(e) => dispatch(setOrder(e.target.value as SortOrder))}
            >
              <MenuItem value='ASC'>Ascending</MenuItem>
              <MenuItem value='DESC'>Descending</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Apply & Reset */}
        <Stack direction='row' spacing={2}>
          <Button type='button' variant='outlined' onClick={handleResetFilters}>
            Reset
          </Button>

          <Button type='submit' variant='contained'>
            Apply Filters
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
