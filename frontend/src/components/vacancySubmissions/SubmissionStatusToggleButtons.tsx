import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { VacancySubmissionStatus } from '../../../types';

const ALL = 'all';

type Props = {
  value?: VacancySubmissionStatus;
  onChange: (status?: VacancySubmissionStatus) => void;
};

const SubmissionStatusToggleButtons = ({ value, onChange }: Props) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    onChange(
      newValue && newValue !== ALL
        ? (newValue as VacancySubmissionStatus)
        : undefined,
    );
  };

  return (
    <ToggleButtonGroup
      value={value ?? ALL}
      exclusive
      onChange={handleChange}
      aria-label='submission status'
      color='primary'
      sx={{ '& .Mui-selected': { fontWeight: 'bold' } }}
    >
      <ToggleButton value={ALL} aria-label='All statuses'>
        ALL
      </ToggleButton>
      {Object.values(VacancySubmissionStatus).map((status) => (
        <ToggleButton key={status} value={status} aria-label={status}>
          {status}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default SubmissionStatusToggleButtons;
