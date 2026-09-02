import {
  LinearProgress,
  Stack,
  Typography,
  type TypographyProps,
} from '@mui/material';
import { progressBarColorBasedOnScore } from '@/shared/lib/muiColors';

interface MatchScoreBarProps {
  matchScore?: number;
  // Bar thickness in px
  height?: number;
  scoreVariant?: TypographyProps['variant'];
}

const MatchScoreBar = ({
  matchScore,
  height = 8,
  scoreVariant = 'body1',
}: MatchScoreBarProps) => {
  return (
    <Stack
      direction='row'
      spacing={2}
      sx={{
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LinearProgress
        variant='determinate'
        aria-label='Match score'
        value={matchScore ?? 0}
        sx={(theme) => {
          const { bgColor } = progressBarColorBasedOnScore(
            matchScore ?? 0,
            theme.palette,
          );

          return {
            flex: 1, // Prevents collapse by telling flexbox to expand the progress bar
            minWidth: 80,
            height,
            borderRadius: height / 2,
            color: bgColor,
            '& .MuiLinearProgress-bar': {
              backgroundColor: bgColor,
            },
          };
        }}
      />
      <Typography variant={scoreVariant} sx={{ color: 'text.secondary' }}>
        {matchScore ?? '-'}
      </Typography>
    </Stack>
  );
};

export default MatchScoreBar;
