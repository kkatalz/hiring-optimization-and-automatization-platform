import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState } from 'react';
import { VacancySubmissionStatus } from '../../../types';

const SubmissionStatusToggleButtons = () => {
  const [alignment, setAlignment] = useState<string | null>('left');

  const handleAlignment = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    setAlignment(newAlignment);
  };

  return (
    <ToggleButtonGroup
      value={alignment}
      exclusive
      onChange={handleAlignment}
      aria-label='text alignment'
      color='primary'
      sx={{ '& .Mui-selected': { fontWeight: 'bold' } }}
    >
      <ToggleButton value='all' aria-label='left aligned'>
        ALL
      </ToggleButton>
      <ToggleButton value='pending' aria-label='centered'>
        {VacancySubmissionStatus.pending.toUpperCase()}
      </ToggleButton>
      <ToggleButton value='interviewing' aria-label='right aligned'>
        {VacancySubmissionStatus.interviewing.toUpperCase()}
      </ToggleButton>
      <ToggleButton value='approved' aria-label='justified'>
        {VacancySubmissionStatus.approved.toUpperCase()}
      </ToggleButton>
      <ToggleButton value='rejected' aria-label='justified'>
        {VacancySubmissionStatus.rejected.toUpperCase()}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default SubmissionStatusToggleButtons;
