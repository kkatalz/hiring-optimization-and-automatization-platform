import type { QuestionCardInfo } from '@/types';
import { Chip, Stack, Typography } from '@mui/material';

interface ShortQuestionInfoProps {
  question: QuestionCardInfo;
}

const ShortQuestionInfo = ({ question }: ShortQuestionInfoProps) => {
  return (
    <Stack sx={{ gap: { xs: 1, sm: 1.5 } }}>
      <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1 }}>
        {question.type && (
          <Chip
            key={question.questionId}
            label={question.type}
            sx={{
              backgroundColor: 'secondary.contrastText',
              color: 'info.contrastText',
            }}
          />
        )}
        <Chip
          key={question.questionId + '-required'}
          label={question.isRequired ? 'required' : 'optional'}
          sx={{
            backgroundColor: 'info.light',
            color: 'info.main',
          }}
        />

        {question.priority && (
          <Chip
            key={question.questionId + '-priority'}
            label={`priority ${question.priority}`}
            variant='outlined'
          />
        )}
        {question.expectedValue && (
          <Chip
            key={question.questionId + '-expected'}
            label={`expected ${typeof question.expectedValue === 'string' ? question.expectedValue : question.expectedValue.join(', ')}`}
            sx={{
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          />
        )}
      </Stack>

      {/* Options */}
      <Stack
        direction='row'
        spacing={1}
        sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
      >
        {question.answerOptions && question.answerOptions.length > 0 && (
          <>
            <Typography variant='body1' sx={{ color: 'text.secondary' }}>
              Options:
            </Typography>
            <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1 }}>
              {question.answerOptions.map((option) => (
                <Chip
                  key={question.questionId + '-option-' + option}
                  label={option}
                  variant='outlined'
                />
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default ShortQuestionInfo;
