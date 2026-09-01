import { Chip, Stack, Typography, type ChipProps } from '@mui/material';
import type { CandidateProfile } from '@/types';
import { capitalizeName } from '@/shared/lib/formatText';
import { useChipColors } from '@/shared/lib/muiColors';

const random = Math.random();

interface Props {
  candidateProfile: CandidateProfile;
  globalDirection: 'row' | 'column';
}

const CandidateInfo = ({ candidateProfile, globalDirection }: Props) => {
  const chipColors = useChipColors();

  const fullName = capitalizeName(
    candidateProfile?.firstName + ' ' + candidateProfile?.lastName,
  );

  const fullNameAbreviated = fullName
    .split(' ')
    .map((name) => name.charAt(0))
    .join('');

  const livingPlace = candidateProfile?.city + ', ' + candidateProfile?.country;
  const experience = candidateProfile?.yearsOfExperience + ' yrs';

  const randomChipColor: ChipProps['color'] =
    chipColors[Math.floor(random * chipColors.length)];

  return (
    <>
      <Stack
        direction={globalDirection}
        spacing={1}
        sx={{ alignItems: 'center' }}
      >
        <Chip
          label={fullNameAbreviated}
          color={randomChipColor}
          sx={{ color: 'text.primary' }}
        />

        <Stack direction='column'>
          <Typography variant='subtitle2'>{fullName}</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {livingPlace} · {experience}
          </Typography>
        </Stack>
      </Stack>
    </>
  );
};

export default CandidateInfo;
