import StarIcon from '@mui/icons-material/Star';
import { Chip, Stack, Typography } from '@mui/material';

const STAR_SX = { '& .MuiChip-icon': { color: 'info.main' } };

interface CandidateRatingProps {
  rating?: number | null;
  variant?: 'chip' | 'text';
  onClick?: () => void;
}

const CandidateRating = ({
  rating,
  variant = 'chip',
  onClick,
}: CandidateRatingProps) => {
  if (rating == null)
    return onClick ? (
      // An unrated submission still needs something to click on
      <Chip label='Not rated' variant='outlined' onClick={onClick} />
    ) : (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        Not rated
      </Typography>
    );

  const label = `${rating}/10`;

  if (variant === 'text')
    return (
      <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
        <StarIcon fontSize='small' sx={{ color: 'info.main' }} />
        <Typography variant='body2'>{label}</Typography>
      </Stack>
    );

  return (
    <Chip label={label} icon={<StarIcon />} sx={STAR_SX} onClick={onClick} />
  );
};

export default CandidateRating;
