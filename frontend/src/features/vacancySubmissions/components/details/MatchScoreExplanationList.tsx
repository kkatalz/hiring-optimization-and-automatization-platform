import { Box, Stack, Typography } from '@mui/material';

interface MatchScoreExplanationListProps {
  explanation: string[];
}

const MatchScoreExplanationList = ({
  explanation,
}: MatchScoreExplanationListProps) => (
  <Box
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: 'action.hover',
      padding: 1.5,
      overflowX: 'auto',
    }}
  >
    <Stack spacing={0.75}>
      {explanation.map((line, index) => {
        const isDimensionDetail = line.startsWith('  ');

        return (
          <Typography
            key={index}
            component='p'
            variant='caption'
            sx={{
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              paddingLeft: isDimensionDetail ? 1.5 : 0,
              color: isDimensionDetail ? 'text.secondary' : 'text.primary',
            }}
          >
            {line.trim()}
          </Typography>
        );
      })}
    </Stack>
  </Box>
);

export default MatchScoreExplanationList;
