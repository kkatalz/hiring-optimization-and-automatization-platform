import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { formatDateTime } from '@/shared/lib/formatDate';
import type { Interview } from '@/types';

interface JoinMeetingLinkProps {
  interview: Interview;
}

/** When clicked, opens the interview's meeting link in a new tab after confirmation. */
const JoinMeetingLink = ({ interview }: JoinMeetingLinkProps) => {
  const [open, setOpen] = useState(false);

  const handleOpenMeeting = () => {
    setOpen(false);
    window.open(interview.meetLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Link
        href={interview.meetLink}
        underline='hover'
        variant='body1'
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
        sx={{ cursor: 'pointer' }}
      >
        {interview.title}
      </Link>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Open the meeting?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            This opens the meeting for {interview.title} in a new tab.
          </DialogContentText>

          <Stack spacing={0.5} sx={{ mt: 2 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {formatDateTime(interview.scheduledDate)} ·{' '}
              {interview.durationMinutes} min
            </Typography>

            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', wordBreak: 'break-all' }}
            >
              {interview.meetLink}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ marginBottom: '15px', marginRight: '20px' }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant='contained'
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenMeeting}
          >
            Open meeting
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JoinMeetingLink;
