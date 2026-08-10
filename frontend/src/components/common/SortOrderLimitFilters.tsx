import { MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setOrder, setSortBy } from '../../features/filters/filterSlice';
import {
  SUBMISSION_SORT_FIELDS,
  VACANCY_SORT_FIELDS,
  type SubmissionSortColumn,
  type VacancySortColumn,
} from '../../../types';
import { ORDER_FIELDS, type SortOrder } from '../../../types/common/Order';
import { formatSortField } from '../../utils/formatText';

interface Props {
  entity: 'vacancies' | 'submissions';
  showLimit?: boolean;
}

const SortOrderLimitFilters = ({ entity, showLimit = true }: Props) => {
  const dispatch = useAppDispatch();

  const appliedFilters = useAppSelector((state) => state.filters);
  const [draft, setDraft] = useState(appliedFilters);

  return (
    <Stack direction='row' spacing={2}>
      {/* Sorting */}
      <TextField
        id='sortby-select'
        select
        label='Sort by'
        value={appliedFilters.sortBy ?? ''}
        onChange={(e) =>
          dispatch(
            setSortBy(
              e.target.value as VacancySortColumn | SubmissionSortColumn,
            ),
          )
        }
        defaultValue='Created at'
        sx={{ minWidth: 150 }}
      >
        {entity === 'vacancies'
          ? VACANCY_SORT_FIELDS.map((option, index) => (
              <MenuItem key={index} value={option}>
                {formatSortField(option)}
              </MenuItem>
            ))
          : entity === 'submissions'
            ? SUBMISSION_SORT_FIELDS.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {formatSortField(option)}
                </MenuItem>
              ))
            : null}
      </TextField>

      {/* Order */}
      <TextField
        id='order-select'
        select
        label='Order'
        value={appliedFilters.order ?? ''}
        disabled={!appliedFilters.sortBy}
        onChange={(e) => dispatch(setOrder(e.target.value as SortOrder))}
        defaultValue='Ascending'
        sx={{ minWidth: 150 }}
      >
        {ORDER_FIELDS.map((option, index) => (
          <MenuItem key={index} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      {/* Limit */}
      {showLimit && (
        <TextField
          label='Limit'
          value={draft.limit}
          onChange={(e) =>
            setDraft({ ...draft, limit: Number(e.target.value) })
          }
          sx={{ maxWidth: 100 }}
        />
      )}
    </Stack>
  );
};

export default SortOrderLimitFilters;
