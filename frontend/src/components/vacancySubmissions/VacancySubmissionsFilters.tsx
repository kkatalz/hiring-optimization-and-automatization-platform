import { Autocomplete, Box, Button, Stack, TextField } from '@mui/material';
import SortOrderLimitFilters from '../common/SortOrderLimitFilters';
import SubmissionStatusToggleButtons from './SubmissionStatusToggleButtons';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useState } from 'react';
import {
  SUBMISSION_SORT_FIELDS,
  submissionInitialState,
  type SubmissionSortColumn,
} from '../../../types';
import {
  applyFilters,
  resetFilters,
  setOrder,
  setSortBy,
} from '../../features/filters/submissionFiltersSlice';
import {
  useGetAllSubmissionsCitiesByVacancyIdQuery,
  useGetAllSubmissionsCountriesByVacancyIdQuery,
  useGetAllSubmissionsLanguagesCodesByVacancyIdQuery,
} from '../../features/api/api';
import { useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { LanguageRequirementsFilter } from '../common/filters/LanguageRequirementsFilter';

const VacancySubmissionsFilters = () => {
  const dispatch = useAppDispatch();

  const appliedFilters = useAppSelector((state) => state.submissionFilters);
  const [draft, setDraft] = useState(appliedFilters);

  const { vacancyId } = useParams();
  const { data: allCities } = useGetAllSubmissionsCitiesByVacancyIdQuery(
    vacancyId ?? skipToken,
  );
  const { data: allCountries } = useGetAllSubmissionsCountriesByVacancyIdQuery(
    vacancyId ?? skipToken,
  );

  const { data: languageCodes } =
    useGetAllSubmissionsLanguagesCodesByVacancyIdQuery(vacancyId ?? skipToken);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(applyFilters(draft));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setDraft({ ...submissionInitialState });
  };

  return (
    <>
      <Stack
        spacing={1.5}
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <SortOrderLimitFilters
            sortFields={SUBMISSION_SORT_FIELDS}
            sortBy={appliedFilters.sortBy}
            order={appliedFilters.order}
            onSortByChange={(sortBy) => {
              dispatch(setSortBy(sortBy as SubmissionSortColumn));
              setDraft({
                ...draft,
                sortBy: sortBy as SubmissionSortColumn,
              });
            }}
            onOrderChange={(order) => {
              dispatch(setOrder(order));
              setDraft({ ...draft, order });
            }}
          />
          <SubmissionStatusToggleButtons />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label='Min match score'
            placeholder='60'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.minMatchScore ?? ''}
            onChange={(e) =>
              setDraft({ ...draft, minMatchScore: Number(e.target.value) })
            }
          />
          <TextField
            label='Min experience (yrs)'
            placeholder='2'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.minYearsOfExperience ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                minYearsOfExperience: Number(e.target.value),
              })
            }
          />
          <TextField
            label='Max experience (yrs)'
            placeholder='10'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.maxYearsOfExperience ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                maxYearsOfExperience: Number(e.target.value),
              })
            }
          />
          <TextField
            label='Min expected salary'
            placeholder='0'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.minSalaryExpectation ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                minSalaryExpectation: Number(e.target.value),
              })
            }
          />
          <TextField
            label='Max expected salary'
            placeholder='10000'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.maxSalaryExpectation ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                maxSalaryExpectation: Number(e.target.value),
              })
            }
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Cities */}
          <Autocomplete
            multiple
            id='cities-outlined'
            options={allCities || []}
            value={draft.cities ?? []}
            getOptionLabel={(option) => option}
            filterSelectedOptions
            renderInput={(params) => <TextField {...params} label='Cities' />}
            onChange={(_event, newValue) => {
              setDraft({
                ...draft,
                cities: newValue.map((option) => option),
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
            slotProps={{
              paper: {
                sx: {
                  width: 'fit-content',
                },
              },
            }}
          />
          {/* Countries */}
          <Autocomplete
            multiple
            id='countries-outlined'
            options={allCountries || []}
            value={draft.countries ?? []}
            getOptionLabel={(option) => option}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField {...params} label='Countries' />
            )}
            onChange={(_event, newValue) => {
              setDraft({
                ...draft,
                countries: newValue.map((option) => option),
              });
            }}
            sx={{
              minWidth: 120,
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
            slotProps={{
              paper: {
                sx: {
                  width: 'fit-content',
                },
              },
            }}
          />

          {/* AI % */}
          <TextField
            label='Max resume AI %'
            placeholder='100'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.maxResumeAiScore ?? ''}
            onChange={(e) =>
              setDraft({ ...draft, maxResumeAiScore: Number(e.target.value) })
            }
            sx={{
              width: 150,
            }}
          />
          <TextField
            label='Max comment AI %'
            placeholder='100'
            slotProps={{
              inputLabel: { shrink: true },
            }}
            value={draft.maxCommentAiScore ?? ''}
            onChange={(e) =>
              setDraft({ ...draft, maxCommentAiScore: Number(e.target.value) })
            }
            sx={{
              width: 150,
            }}
          />
        </Box>

        {/* Language requirements */}
        <LanguageRequirementsFilter
          value={draft.languages ?? []}
          onChange={(next) => setDraft({ ...draft, languages: next })}
          languageCodes={languageCodes ?? []}
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
    </>
  );
};

export default VacancySubmissionsFilters;
