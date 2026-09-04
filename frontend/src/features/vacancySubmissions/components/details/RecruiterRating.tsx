import StarIcon from '@mui/icons-material/Star';
import { Chip, Stack, Typography } from '@mui/material';

const STAR_SX = { '& .MuiChip-icon': { color: 'info.main' } };

interface RecruiterRatingProps {
  recruiterRating?: number | null;
  variant?: 'chip' | 'text';
}

const RecruiterRating = ({
  recruiterRating,
  variant = 'chip',
}: RecruiterRatingProps) => {
  if (recruiterRating == null)
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        Not rated
      </Typography>
    );

  const label = `${recruiterRating}/10`;

  if (variant === 'text')
    return (
      <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
        <StarIcon fontSize='small' sx={{ color: 'info.main' }} />
        <Typography variant='body2'>{label}</Typography>
      </Stack>
    );

  return <Chip label={label} icon={<StarIcon />} sx={STAR_SX} />;
};

export default RecruiterRating;
