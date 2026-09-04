import { Chip } from '@mui/material';
import { themeColorsBasedOnScore } from '@/shared/lib/muiColors';
import CircleIcon from '@mui/icons-material/Circle';

interface ResumeAiDetectionChipProps {
  source?: 'resume' | 'comment';
  score?: number | null;
  label: 'AI' | 'human';
  text?: string;
}

const PercentageChip = ({
  source = 'resume',
  score,
  label,
  text,
}: ResumeAiDetectionChipProps) => {
  // Both chips must have the same color. Two different values 'scoreValue' and 'score' are deliberate.
  const scoreValue = label === 'human' ? 100 - (score ?? 0) : score;

  return score !== undefined && score !== null ? (
    <Chip
      icon={<CircleIcon />}
      label={`${scoreValue}% ${label}`}
      sx={(theme) => {
        const { bgColor, textColor } = themeColorsBasedOnScore(
          score!,
          theme.palette,
        );

        return {
          backgroundColor: bgColor,
          color: textColor,
          padding: '2px',
          '& .MuiChip-icon': {
            color: textColor,
            fontSize: 'medium',
          },
        };
      }}
    />
  ) : text ? (
    <Chip label={`No score for ${source} (text is too short)`} />
  ) : (
    <Chip label={`No ${source}`} />
  );
};

export default PercentageChip;
