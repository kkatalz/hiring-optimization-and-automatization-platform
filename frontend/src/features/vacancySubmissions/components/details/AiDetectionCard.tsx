import AiDetectionScoreBar from '@/features/vacancySubmissions/components/details/AiDetectionScoreBar';
import PercentageChip from '@/features/vacancySubmissions/components/details/PercentageChip';
import SubmittedText from '@/features/vacancySubmissions/components/details/SubmittedText';
import type { VacancySubmission } from '@/types';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';

interface AiDetectionCardProps {
  submission: VacancySubmission;
}

const AiDetectionCard = ({ submission }: AiDetectionCardProps) => {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant='h6'>AI-content detection</Typography>

        {/* Resume AI score results */}
        <Stack
          direction='row'
          spacing={1}
          sx={{ flexWrap: 'wrap', alignItems: 'center' }}
        >
          <Typography
            variant='body1'
            sx={{
              color: 'text.secondary',
            }}
          >
            Resume AI score results:
          </Typography>
          <PercentageChip score={submission.resumeAiScore} label='AI' />
          <PercentageChip score={submission.resumeAiScore} label='human' />
        </Stack>
        <AiDetectionScoreBar aiScore={submission.resumeAiScore} />
        <SubmittedText text={submission.resume} source='resume' />

        <Divider />
        {/* Comment AI score results */}
        <Stack
          direction='row'
          spacing={1}
          sx={{ flexWrap: 'wrap', alignItems: 'center' }}
        >
          <Typography
            variant='body1'
            sx={{
              color: 'text.secondary',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            Comment AI score results:
          </Typography>
          <PercentageChip
            source='comment'
            score={submission.commentAiScore}
            label='AI'
          />
          <PercentageChip
            source='comment'
            score={submission.commentAiScore}
            label='human'
          />
        </Stack>
        <AiDetectionScoreBar aiScore={submission.commentAiScore} />
        <SubmittedText text={submission.comment} source='comment' />
      </CardContent>
    </Card>
  );
};

export default AiDetectionCard;
