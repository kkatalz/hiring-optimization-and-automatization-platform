import {
  Stack
} from '@mui/material';
import SortOrderLimitFilters from '../common/SortOrderLimitFilters';
import SubmissionStatusToggleButtons from './SubmissionStatusToggleButtons';

const VacancySubmissionsFilters = () => {
  return (
    <Stack direction='row' spacing={2} sx={{ mb: 3 }}>
      <SortOrderLimitFilters entity='submissions' showLimit={false} />
      <SubmissionStatusToggleButtons />
    </Stack>
  );
};

export default VacancySubmissionsFilters;
