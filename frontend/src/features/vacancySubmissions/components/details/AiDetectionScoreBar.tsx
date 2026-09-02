import { aiDetectionBarColorBasedOnScore } from '@/shared/lib/muiColors';
import { LinearProgress, Stack, Typography } from '@mui/material';

interface AiDetectionScoreBarProps {
  aiScore?: number | null;
}

const AiDetectionScoreBar = ({ aiScore }: AiDetectionScoreBarProps) => {
  if (aiScore === null || aiScore === undefined) return;

  return (
    <Stack
      direction='row'
      sx={{
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <LinearProgress
        variant='determinate'
        aria-label='Ai detection score'
        value={aiScore}
        min={0}
        max={100}
        sx={(theme) => {
          const { bgColor } = aiDetectionBarColorBasedOnScore(
            aiScore,
            theme.palette,
          );

          return {
            flex: 1, // Prevents collapse by telling flexbox to expand the progress bar
            minWidth: 80,
            height: 10,
            borderRadius: 5,
            color: bgColor,
            '& .MuiLinearProgress-bar': {
              backgroundColor: bgColor,
            },
          };
        }}
      />
      <Typography variant='body1' sx={{ color: 'text.secondary' }}>
        {aiScore}% AI
      </Typography>
    </Stack>
  );
};

export default AiDetectionScoreBar;
