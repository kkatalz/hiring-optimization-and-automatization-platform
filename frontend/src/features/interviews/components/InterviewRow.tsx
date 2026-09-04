import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Stack, Typography } from '@mui/material';
import { formatDateTime } from '@/shared/lib/formatDate';
import type { Interview } from '@/types';
import InterviewStatusChip from './InterviewStatusChip';
import JoinMeetingLink from './JoinMeetingLink';

interface InterviewRowProps {
  interview: Interview;
}

const InterviewRow = ({ interview }: InterviewRowProps) => {
  return (
    <Stack
      direction='row'
      spacing={1.5}
      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
    >
      <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
        <CalendarMonthIcon sx={{ color: 'text.secondary' }} />

        <Stack>
          {/* Title carries the meeting link */}
          <JoinMeetingLink interview={interview} />

          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {formatDateTime(interview.scheduledDate)}
          </Typography>
        </Stack>
      </Stack>

      <InterviewStatusChip interviewStatus={interview.status} />
    </Stack>
  );
};

export default InterviewRow;
