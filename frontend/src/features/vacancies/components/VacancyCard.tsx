import { Card, CardContent, ListItem, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { VacancySummary } from '@/types';
import ShortVacancyInfo from './ShortVacancyInfo';

interface VacancyCardProps {
  vacancy: VacancySummary;
  index: number;
  onClick: () => void;
  /** Passed only by admin|superAdmin|recruiter.*/
  actions?: ReactNode;
}

const VacancyCard = ({
  vacancy,
  index,
  onClick,
  actions,
}: VacancyCardProps) => {
  return (
    <ListItem
      alignItems='flex-start'
      disableGutters
      onClick={onClick}
      sx={{ cursor: 'pointer' }}
    >
      <Card elevation={4} sx={{ width: '100%' }}>
        <CardContent>
          <Stack
            direction='row'
            sx={{
              alignItems: 'center',
              p: 2,
              gap: 5,
              justifyContent: 'space-between',
            }}
          >
            {/* Left panel */}
            <ShortVacancyInfo
              vacancy={vacancy}
              index={index}
              showDescription={true}
            />

            {actions && (
              <Stack
                direction='column'
                spacing={1}
                sx={{ alignItems: 'center' }}
              >
                <Typography
                  variant='subtitle2'
                  color='primary.light'
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {vacancy?.numberOfSubmissions ?? 0} submissions
                </Typography>

                <Stack
                  direction='row'
                  spacing={1}
                  sx={{
                    justifyContent: 'center',
                    gap: 1,
                  }}
                  // Keep a click on Edit or Delete from opening the vacancy.
                  onClick={(e) => e.stopPropagation()}
                >
                  {actions}
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </ListItem>
  );
};

export default VacancyCard;
