import { capitalizeName } from '@/shared/lib/formatText';
import { chipColorBasedOnStatus } from '@/shared/lib/muiColors';
import { Chip } from '@mui/material';

interface ApplicationStatusChipProps {
  submissionStatus: string;
}

const ApplicationStatusChip = ({
  submissionStatus,
}: ApplicationStatusChipProps) => {
  return (
    <Chip
      label={capitalizeName(submissionStatus)}
      sx={(theme) => {
        const { bgColor } = chipColorBasedOnStatus(
          submissionStatus,
          theme.palette,
        );
        return {
          backgroundColor: bgColor,
          color: theme.palette.getContrastText(bgColor),
        };
      }}
    />
  );
};

export default ApplicationStatusChip;
