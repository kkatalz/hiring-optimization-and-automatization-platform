import ShortQuestionInfo from '@/features/questions/components/ShortQuestionInfo';
import DeleteQuestionButton from '@/features/questions/components/DeleteQuestionButton';
import type { QuestionCardInfo } from '@/types';
import { Card, CardContent, ListItem, Stack, Typography } from '@mui/material';

interface QuestionCardProps {
  questionInfo: QuestionCardInfo;
  onNotify: (message: string, severity: 'success' | 'error') => void;
}

const QuestionCard = ({ questionInfo, onNotify }: QuestionCardProps) => {
  return (
    <ListItem alignItems='flex-start' disableGutters>
      <Card elevation={3} sx={{ width: '100%' }}>
        <CardContent sx={{ padding: { xs: 1, sm: 2 } }}>
          <Stack
            direction='row'
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingX: { xs: 0, sm: 1 },
            }}
          >
            <Stack direction='column'>
              <Typography variant='h6' sx={{ paddingBottom: 1 }}>
                {questionInfo?.label}
              </Typography>
              <ShortQuestionInfo question={questionInfo} />
            </Stack>
            <DeleteQuestionButton
              questionId={questionInfo.questionId}
              onNotify={onNotify}
            />
          </Stack>
        </CardContent>
      </Card>
    </ListItem>
  );
};

export default QuestionCard;
