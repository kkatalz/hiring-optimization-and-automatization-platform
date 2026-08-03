import { Chip, Stack, Typography } from '@mui/material';
import BagOfMoney from '../../assets/BagOfMoney.svg';
import Statistics from '../../assets/Statistics.svg';
import TalkingPerson from '../../assets/TalkingPerson.svg';
import type { Vacancy } from '../../../types';
import { capitalizeVacancyName } from '../../utils/formatText';

const getSalaryLabel = (vacancy: Vacancy) => {
  const { minSalary, maxSalary } = vacancy;

  if (minSalary && maxSalary) return `$${minSalary} - $${maxSalary}`;
  if (minSalary) return `$${minSalary}+`;
  if (maxSalary) return `Up to $${maxSalary}`;

  return null;
};

interface ShortVacancyInfoProps {
  vacancy: Vacancy;
  index: number;
  showDescription: boolean;
}

/** Show chips for an easy vacancy identification */
const ShortVacancyInfo = ({
  vacancy,
  index,
  showDescription,
}: ShortVacancyInfoProps) => {
  const salaryLabel = getSalaryLabel(vacancy);

  return (
    <Stack spacing={1}>
      <Stack direction='row' spacing={1}>
        <Typography variant='h6'>
          {capitalizeVacancyName(vacancy.name)}
        </Typography>
        {vacancy.timeCommitment && (
          <Chip
            label={vacancy.timeCommitment.replace('_', ' ')}
            sx={{
              backgroundColor:
                index % 2 === 0 ? 'primary.light' : 'secondary.contrastText',
            }}
          />
        )}
      </Stack>

      {showDescription && (
        <Typography variant='subtitle2' color='primary.light'>
          {vacancy.description}
        </Typography>
      )}

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
          vacancy.languageRequirements.map((lang, langIndex) => (
            <Chip
              key={`${lang.code ?? 'any'}-${lang.level ?? 'any'}-${langIndex}`}
              label={`${lang.code?.toUpperCase() ?? 'Any'} - ${lang.level ?? 'Any'}`}
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
  );
};

export default ShortVacancyInfo;
