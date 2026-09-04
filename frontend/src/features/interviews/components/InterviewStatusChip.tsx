import { Chip } from '@mui/material';
import { capitalizeName } from '@/shared/lib/formatText';
import { chipColorsBasedOnInterviewStatus } from '@/shared/lib/muiColors';
import type { InterviewStatus } from '@/types';

interface InterviewStatusChipProps {
  interviewStatus: InterviewStatus;
}

const InterviewStatusChip = ({ interviewStatus }: InterviewStatusChipProps) => {
  return (
    <Chip
      label={capitalizeName(interviewStatus)}
      size='small'
      sx={(theme) => {
        const { bgColor, textColor } = chipColorsBasedOnInterviewStatus(
          interviewStatus,
          theme.palette,
        );

        return {
          backgroundColor: bgColor,
          color: textColor,
        };
      }}
    />
  );
};

export default InterviewStatusChip;
