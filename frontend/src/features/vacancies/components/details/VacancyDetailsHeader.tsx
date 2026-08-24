import { Stack } from '@mui/material';
import type { ReactNode } from 'react';
import type { VacancySummary } from '@/types';
import ShortVacancyInfo from '../ShortVacancyInfo';

interface VacancyDetailsHeaderProps {
  vacancy: VacancySummary;
  actions?: ReactNode;
}

const VacancyDetailsHeader = ({
  vacancy,
  actions,
}: VacancyDetailsHeaderProps) => {
  return (
    <Stack
      direction='row'
      sx={{
        mb: 2,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'space-between',
      }}
    >
      <ShortVacancyInfo vacancy={vacancy} index={0} showDescription={false} />

      {actions && (
        <Stack
          direction='row'
          spacing={1}
          sx={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 1,
          }}
        >
          {actions}
        </Stack>
      )}
    </Stack>
  );
};

export default VacancyDetailsHeader;
