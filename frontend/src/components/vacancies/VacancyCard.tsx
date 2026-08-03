import { Card, CardContent, ListItem, Stack, Typography } from '@mui/material';
import UpdateVacancyForm from './UpdateVacancy';
import DeleteVacancyButton from './DeleteVacancyButton';
import type { Vacancy } from '../../../types';
import ShortVacancyInfo from './ShortVacancyInfo';

interface VacancyCardProps {
  vacancy: Vacancy;
  index: number;
  setNotification: (message: string, severity: 'success' | 'error') => void;
  onClick: () => void;
}

const VacancyCard = ({
  vacancy,
  index,
  setNotification,
  onClick,
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

            {/* Edit & Delete */}
            <Stack direction='column' spacing={1} sx={{ alignItems: 'center' }}>
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
              >
                <UpdateVacancyForm
                  vacancyId={vacancy.id}
                  initialData={{
                    name: vacancy.name,
                    description: vacancy.description,
                    minSalary: vacancy.minSalary,
                    maxSalary: vacancy.maxSalary,
                    timeCommitment: vacancy.timeCommitment,
                    languageRequirements: vacancy.languageRequirements,
                    requiredYearsOfExperience:
                      vacancy.requiredYearsOfExperience,
                    tags: vacancy.tags,
                    customWeights: vacancy.customWeights,
                  }}
                />
                <DeleteVacancyButton
                  vacancyId={vacancy.id}
                  onNotify={(message, severity) =>
                    setNotification(message, severity)
                  }
                />
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </ListItem>
  );
};

export default VacancyCard;
