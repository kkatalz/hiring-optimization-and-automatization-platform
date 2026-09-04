import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import { Avatar, Card, Chip, Stack, Typography } from '@mui/material';
import { capitalizeName, formatSortField } from '@/shared/lib/formatText';
import type { CandidateProfile, User } from '@/types';

interface MetaProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Meta = ({ icon, children }: MetaProps) => (
  <Stack
    direction='row'
    spacing={0.75}
    sx={{ alignItems: 'center', color: 'text.secondary', minWidth: 0 }}
  >
    {icon}
    <Typography variant='body2'>{children}</Typography>
  </Stack>
);

interface ProfileHeaderCardProps {
  user: User;
  candidateProfile?: CandidateProfile;
}

const ProfileHeaderCard = ({
  user,
  candidateProfile,
}: ProfileHeaderCardProps) => {
  const fullName = capitalizeName(`${user.firstName} ${user.lastName}`);

  const initials = fullName
    .split(' ')
    .map((name) => name.charAt(0))
    .join('');

  const livingPlace = [candidateProfile?.city, candidateProfile?.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Card sx={{ borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 3 }}
        sx={{
          alignItems: { xs: 'center', sm: 'flex-end' },
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Avatar
          sx={{
            width: 96,
            height: 96,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '2rem',
            fontWeight: 'bold',
            border: 3,
            borderColor: 'background.paper',
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>

        <Stack
          spacing={1}
          sx={{
            minWidth: 0,
            pb: { sm: 0.5 },
            alignItems: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Stack
            direction='row'
            spacing={1.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
          >
            <Typography variant='h5' sx={{ fontWeight: 600 }}>
              {fullName}
            </Typography>
            <Chip
              label={formatSortField(user.role)}
              size='small'
              sx={{
                backgroundColor: 'primary.light',
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 2 }}
            sx={{
              flexWrap: 'wrap',
              rowGap: 0.5,
              alignItems: { xs: 'center', sm: 'center' },
            }}
          >
            <Meta icon={<EmailOutlinedIcon fontSize='small' />}>
              {user.email}
            </Meta>

            {livingPlace && (
              <Meta icon={<PlaceOutlinedIcon fontSize='small' />}>
                {livingPlace}
              </Meta>
            )}

            {candidateProfile && (
              <Meta icon={<WorkHistoryOutlinedIcon fontSize='small' />}>
                {candidateProfile.yearsOfExperience}{' '}
                {candidateProfile.yearsOfExperience === 1 ? 'year' : 'years'} of
                experience
              </Meta>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ProfileHeaderCard;
