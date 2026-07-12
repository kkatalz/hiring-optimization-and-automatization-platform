import {
  Card,
  CardContent,
  Chip,
  ListItem,
  Stack,
  Typography,
} from '@mui/material';
import UpdateVacancyForm from './UpdateVacancy';
import DeleteVacancyButton from './DeleteVacancyButton';
import type { Vacancy } from '../../../types';
import BagOfMoney from '../../assets/BagOfMoney.svg';
import Statistics from '../../assets/Statistics.svg';
import TalkingPerson from '../../assets/TalkingPerson.svg';

const getSalaryLabel = (vacancy: Vacancy) => {
  const { minSalary, maxSalary } = vacancy;

  if (minSalary && maxSalary) return `$${minSalary} - $${maxSalary}`;
  if (minSalary) return `$${minSalary}+`;
  if (maxSalary) return `Up to $${maxSalary}`;

  return null;
};

interface VacancyCardProps {
  vacancy: Vacancy;
  index: number;
  setNotification: (message: string, severity: 'success' | 'error') => void;
}

const VacancyCard = ({ vacancy, index, setNotification }: VacancyCardProps) => {
  const salaryLabel = getSalaryLabel(vacancy);

  return (
    <ListItem alignItems='flex-start'>
      <Card elevation={4} sx={{ width: '100%' }}>
        <CardContent>
          <Stack
            direction='row'
            sx={{
              alignItems: 'center',
              p: 2,
              gap: 3,
              justifyContent: 'space-between',
            }}
          >
            {/* Left panel */}
            <Stack spacing={1}>
              <Stack direction='row' spacing={1}>
                <Typography variant='h6'>{vacancy.name}</Typography>
                {vacancy.timeCommitment && (
                  <Chip
                    label={vacancy.timeCommitment.replace('_', ' ')}
                    sx={{
                      backgroundColor:
                        index % 2 === 0
                          ? 'primary.light'
                          : 'secondary.contrastText',
                    }}
                  />
                )}
              </Stack>

              <Typography variant='subtitle2' color='primary.light'>
                {vacancy.description}
              </Typography>

              {/* ---- Chips ----- */}
              <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1 }}>
                {/* Tags */}
                {vacancy.tags &&
                  vacancy.tags.map((tag) => (
                    <Chip key={tag} label={tag} variant='outlined' />
                  ))}
                {/* Salary */}
                {salaryLabel && (
                  <Chip
                    icon={
                      <img
                        src={BagOfMoney}
                        alt='Salary'
                        style={{ width: 16, height: 16 }}
                      />
                    }
                    label={salaryLabel}
                    sx={{ px: 0.5, justifyContent: 'space-between' }}
                  />
                )}
                {/* Experience */}
                {typeof vacancy.requiredYearsOfExperience === 'number' && (
                  <Chip
                    icon={
                      <img
                        src={Statistics}
                        alt='Experience'
                        style={{ width: 16, height: 16 }}
                      />
                    }
                    label={
                      vacancy.requiredYearsOfExperience === 0
                        ? 'No experience'
                        : `${vacancy.requiredYearsOfExperience} yrs`
                    }
                    sx={{ px: 0.5, justifyContent: 'space-between' }}
                  />
                )}
                {vacancy.languageRequirements &&
                  vacancy.languageRequirements.length > 0 &&
                  vacancy.languageRequirements.map((lang) => (
                    <Chip
                      key={lang.code}
                      label={`${lang.code.toUpperCase()} - ${lang.level}`}
                      icon={
                        <img
                          src={TalkingPerson}
                          alt='Language'
                          style={{ width: 16, height: 16 }}
                        />
                      }
                      sx={{ px: 0.5, justifyContent: 'space-between' }}
                    />
                  ))}
              </Stack>
            </Stack>

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
