import {
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useGetPublicVacancyQuestionsQuery } from '@/features/vacancies/api/vacancyEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import {
  QuestionType,
  type PublicVacancyQuestion,
  type QuestionAnswer,
} from '@/types';

const answerHint: Record<QuestionType, string> = {
  [QuestionType.boolean]: 'Yes or no',
  [QuestionType.text]: 'Free text',
  [QuestionType.dropdown]: 'Pick one of',
};

const formatAnswer = (
  value: QuestionAnswer['value'],
  type: QuestionType,
): string | null => {
  if (Array.isArray(value)) return value.length ? value.join(', ') : null;

  if (!value?.trim()) return null;

  if (type === QuestionType.boolean) return value === 'true' ? 'Yes' : 'No';

  return value;
};

interface QuestionPreviewProps {
  question: PublicVacancyQuestion;
  index: number;
  answer?: QuestionAnswer;
  hasApplied: boolean;
}

const QuestionPreview = ({
  question,
  index,
  answer,
  hasApplied,
}: QuestionPreviewProps) => {
  const givenAnswer = formatAnswer(answer?.value, question.type);

  return (
    <Stack direction='row' spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Typography
        variant='body2'
        sx={{ color: 'text.secondary', minWidth: 20, mt: 0.25 }}
      >
        {index + 1}.
      </Typography>

      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Typography variant='body1'>
          {question.label}
          {question.isRequired && !hasApplied && (
            <Typography component='span' sx={{ color: 'error.main' }}>
              {' *'}
            </Typography>
          )}
        </Typography>

        {/* Once the answer exists it replaces the hint: what the field would
            have accepted no longer helps, and repeating every dropdown option
            next to the chosen one only adds noise. */}
        {hasApplied ? (
          givenAnswer ? (
            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
              {givenAnswer}
            </Typography>
          ) : (
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', fontStyle: 'italic' }}
            >
              Not answered
            </Typography>
          )
        ) : (
          <Stack
            direction='row'
            spacing={0.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
          >
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {answerHint[question.type]}
            </Typography>

            {question.type === QuestionType.dropdown &&
              question.answerOptions?.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  size='small'
                  variant='outlined'
                />
              ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

interface ScreeningQuestionsPreviewProps {
  vacancyId: string;
  hasApplied: boolean;
  answers?: QuestionAnswer[];
}

/**
 * The screening questions of a vacancy, with the candidate's answers
 * or with placeholders for the questions when candidate has not applied.
 *
 * - Card with a title and a count of questions.
 */
const ScreeningQuestionsPreview = ({
  vacancyId,
  hasApplied,
  answers,
}: ScreeningQuestionsPreviewProps) => {
  const {
    data: questions,
    isLoading,
    error,
  } = useGetPublicVacancyQuestionsQuery(vacancyId);

  if (isLoading) return null;
  if (!error && !questions?.length) return null;

  const answerByQuestionId = new Map(
    answers?.map((answer) => [answer.questionId, answer]),
  );

  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack
          direction='row'
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant='h6'>
            {hasApplied ? 'Your screening answers' : 'Screening questions'}
          </Typography>
          {questions?.length ? (
            <Chip label={questions.length} size='small' />
          ) : null}
        </Stack>

        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {hasApplied
            ? 'What you answered when you applied. These cannot be changed.'
            : 'You answer these when you apply. The ones marked * are required.'}
        </Typography>

        {error && (
          <Alert severity='error'>
            Could not load the screening questions - {getErrorMessage(error)}
          </Alert>
        )}

        <Stack spacing={2}>
          {questions?.map((question, index) => (
            <QuestionPreview
              key={question.questionId}
              question={question}
              index={index}
              answer={answerByQuestionId.get(question.questionId)}
              hasApplied={hasApplied}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ScreeningQuestionsPreview;
