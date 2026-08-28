import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import {
  ALL_TIME_COMMITMENTS,
  initialState,
  VACANCY_SORT_FIELDS,
  type VacancySortColumn,
} from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  useGetAllVacanciesLanguagesCodesQuery,
  useGetAllVacanciesTagsQuery,
} from '@/features/vacancies/api/vacancyEndpoints';
import {
  applyFilters,
  resetFilters,
  setOrder,
  setSortBy,
} from '@/features/vacancies/model/vacancyFiltersSlice';
import SortOrderLimitFilters from '../../../shared/ui/SortOrderLimitFilters';
import { LanguageRequirementsFilter } from '../../../shared/ui/filters/LanguageRequirementsFilter';
import { Grid } from '@mui/material';

export const VacanciesFilters = () => {
  const dispatch = useAppDispatch();

  const appliedFilters = useAppSelector((state) => state.vacancyFilters);
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
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: '20px' },
        maxWidth: '650px',
      }}
    >
      <Stack component='form' onSubmit={handleSubmit} spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label='Name'
              placeholder='e.g. React Developer'
              slotProps={{
                inputLabel: { shrink: true },
              }}
              value={draft.name ?? ''}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
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
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
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
              fullWidth
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Tags */}
            <Autocomplete
              multiple
              id='tags-outlined'
              options={allTags || []}
              value={draft.tags ?? []}
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
                '& .MuiAutocomplete-tag': {
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                },
                // Target the delete/cancel icon
                '& .MuiAutocomplete-tag .MuiChip-deleteIcon': {
                  color: 'primary.main',
                },
              }}
              slotProps={{
                paper: {
                  sx: {
                    width: 'fit-content',
                  },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
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
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
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
              fullWidth
            />
          </Grid>
        </Grid>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              maxWidth: { xs: '100%', md: 230 },
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

        {/* Language requirements */}
        <LanguageRequirementsFilter
          value={draft.languageRequirements ?? []}
          onChange={(next) =>
            setDraft({ ...draft, languageRequirements: next })
          }
          languageCodes={languageCodes ?? []}
        />

        <SortOrderLimitFilters
          sortFields={VACANCY_SORT_FIELDS}
          sortBy={appliedFilters.sortBy}
          order={appliedFilters.order}
          onSortByChange={(sortBy) => {
            dispatch(setSortBy(sortBy as VacancySortColumn));
            setDraft({
              ...draft,
              sortBy: sortBy as VacancySortColumn,
            });
          }}
          onOrderChange={(order) => {
            dispatch(setOrder(order));
            setDraft({ ...draft, order });
          }}
          limit={draft.limit}
          onLimitChange={(limit) => setDraft({ ...draft, limit })}
        />

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
