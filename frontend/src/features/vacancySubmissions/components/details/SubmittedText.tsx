import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Collapse, Stack, Typography } from '@mui/material';
import { useState } from 'react';

interface SubmittedTextProps {
  text?: string;
  source: 'resume' | 'comment';
}

/**
 * The text the AI-detection score was calculated from, hidden behind a toggle.
 * Collapsed by default
 */
const SubmittedText = ({ text, source }: SubmittedTextProps) => {
  const [isTextOpen, setIsTextOpen] = useState(false);

  if (!text?.trim())
    return (
      <Typography
        variant='body2'
        sx={{ color: 'text.secondary', fontStyle: 'italic' }}
      >
        No {source} submitted.
      </Typography>
    );

  return (
    <Stack spacing={1}>
      <Button
        size='small'
        variant='text'
        aria-expanded={isTextOpen}
        endIcon={isTextOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setIsTextOpen((isOpen) => !isOpen)}
        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
      >
        {isTextOpen ? `Hide ${source}` : `Show ${source}`}
      </Button>

      <Collapse in={isTextOpen} unmountOnExit>
        <Box
          tabIndex={0}
          role='region'
          aria-label={`Submitted ${source} text`}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'action.hover',
            padding: 1.5,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          <Typography
            variant='body2'
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {text}
          </Typography>
        </Box>
      </Collapse>
    </Stack>
  );
};

export default SubmittedText;
