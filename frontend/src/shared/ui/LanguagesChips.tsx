import type {
  CandidateLanguageProficiency,
  LanguageProficiency,
} from '@/types';
import { Chip, Stack } from '@mui/material';
import TalkingPerson from '@/assets/TalkingPerson.svg';

interface LanguagesChipsProps {
  languages: LanguageProficiency[] | CandidateLanguageProficiency[] | undefined;
}

const LanguagesChips = ({ languages }: LanguagesChipsProps) => {
  if (!languages || languages.length === 0) return null;

  return (
    <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1 }}>
      {languages.map((lang, langIndex) => (
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
  );
};

export default LanguagesChips;
