import AiDetectionScoreBar from '@/features/vacancySubmissions/components/details/AiDetectionScoreBar';
import PercentageChip from '@/features/vacancySubmissions/components/details/PercentageChip';
import SubmittedText from '@/features/vacancySubmissions/components/details/SubmittedText';
import type { VacancySubmission } from '@/types';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';

interface ScoreChipsProps {
  text?: string;
  score?: number | null;
  source: 'resume' | 'comment';
}

// Show only one chip if the score is undefined or null instead of two chips.
const ScoreChips = ({ text, score, source }: ScoreChipsProps) => {
  if (score === undefined || score === null)
    return (
      <PercentageChip source={source} score={score} label='AI' text={text} />
    );

  return (
    <>
      <PercentageChip source={source} score={score} label='AI' text={text} />
      <PercentageChip source={source} score={score} label='human' text={text} />
    </>
  );
};

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
          <ScoreChips
            text={submission.resume}
            source='resume'
            score={submission.resumeAiScore}
          />
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
          <ScoreChips
            text={submission.comment}
            source='comment'
            score={submission.commentAiScore}
          />
        </Stack>
        <AiDetectionScoreBar aiScore={submission.commentAiScore} />
        <SubmittedText text={submission.comment} source='comment' />
      </CardContent>
    </Card>
  );
};

export default AiDetectionCard;
