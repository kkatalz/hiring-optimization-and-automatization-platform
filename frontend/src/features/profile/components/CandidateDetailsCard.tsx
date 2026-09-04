import { Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import SubmittedText from '@/features/vacancySubmissions/components/details/SubmittedText';
import LanguagesChips from '@/shared/ui/LanguagesChips';
import type { CandidateProfile } from '@/types';
import SectionCard from './SectionCard';

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

const DetailRow = ({ label, children }: DetailRowProps) => (
  <Stack direction='row' spacing={2} sx={{ justifyContent: 'space-between' }}>
    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    {children}
  </Stack>
);

const Placeholder = ({ children }: { children: ReactNode }) => (
  <Typography
    variant='body2'
    sx={{ color: 'text.secondary', fontStyle: 'italic' }}
  >
    {children}
  </Typography>
);

interface CandidateDetailsCardProps {
  candidateProfile: CandidateProfile;
}

const CandidateDetailsCard = ({
  candidateProfile,
}: CandidateDetailsCardProps) => {
  const { yearsOfExperience, city, country, languages, resume } =
    candidateProfile;

  const livingPlace = [city, country].filter(Boolean).join(', ');

  return (
    <SectionCard title='Hiring details'>
      <Stack spacing={1.5}>
        <DetailRow label='Experience'>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            {yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'}
          </Typography>
        </DetailRow>

        <DetailRow label='Location'>
          {livingPlace ? (
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {livingPlace}
            </Typography>
          ) : (
            <Placeholder>Not set</Placeholder>
          )}
        </DetailRow>
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Languages
        </Typography>
        {languages?.length ? (
          <LanguagesChips languages={languages} />
        ) : (
          <Placeholder>No languages added yet.</Placeholder>
        )}
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Resume
        </Typography>
        <SubmittedText text={resume} source='resume' />
      </Stack>
    </SectionCard>
  );
};

export default CandidateDetailsCard;
