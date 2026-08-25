import { MenuItem, Stack, TextField } from '@mui/material';
import { ORDER_FIELDS, type SortOrder } from '@/types/common/Order';
import { formatSortField } from '@/shared/lib/formatText';

interface Props<T extends string> {
  sortFields: readonly T[];
  sortBy?: T;
  order?: SortOrder;
  onSortByChange?: (sortBy: T | undefined) => void;
  onOrderChange?: (order: SortOrder | undefined) => void;
  limit?: number;
  onLimitChange?: (limit: number | undefined) => void;
}

const SortOrderLimitFilters = ({
  sortFields,
  sortBy,
  order,
  onSortByChange,
  onOrderChange,
  limit,
  onLimitChange,
}: Props<string>) => {
  return (
    <Stack direction='row' spacing={2}>
      {/* Sorting */}
      <TextField
        id='sortby-select'
        select
        label='Sort by'
        value={sortBy ?? ''}
        onChange={(e) => {
          const next = e.target.value;
          onSortByChange?.(next === '' ? undefined : next);
        }}
        sx={{ minWidth: 150 }}
      >
        {sortFields.map((option) => (
          <MenuItem key={option} value={option}>
            {formatSortField(option)}
          </MenuItem>
        ))}
      </TextField>

      {/* Order */}
      <TextField
        id='order-select'
        select
        label='Order'
        value={order ?? ''}
        disabled={!sortBy}
        onChange={(e) => {
          const next = e.target.value;
          onOrderChange?.(next === '' ? undefined : (next as SortOrder));
        }}
        sx={{ minWidth: 150 }}
      >
        {ORDER_FIELDS.map((option, index) => (
          <MenuItem key={index} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      {/* Limit */}
      {onLimitChange && (
        <TextField
          label='Limit'
          value={limit ?? ''}
          onChange={(e) => {
            const next = e.target.value;
            onLimitChange?.(next === '' ? undefined : Number(next));
          }}
          sx={{ maxWidth: 100 }}
        />
      )}
    </Stack>
  );
};

export default SortOrderLimitFilters;
