import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useGetMatchScoreExplanationQuery } from '@/features/vacancySubmissions/api/vacancySubmissionEndpoints';
import ApplicationStatusChip from '@/features/vacancySubmissions/components/details/ApplicationStatusChip';
import ExpectedSalary from '@/features/vacancySubmissions/components/details/ExpectedSalary';
import MatchScoreExplanationList from '@/features/vacancySubmissions/components/details/MatchScoreExplanationList';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import { formatDate } from '@/shared/lib/formatDate';
import { capitalizeName } from '@/shared/lib/formatText';
import type { CandidateSubmission } from '@/types';

interface MyApplicationRowProps {
  application: CandidateSubmission;
}

/**
 * One row of "My applications", with the candidate's own match score
 * breakdown behind a toggle.
 *
 * The breakdown lives in its own component because each row opens and closes
 * on its own, and because the request should only go out for the row the
 * candidate actually asked about.
 */
const MyApplicationRow = ({ application }: MyApplicationRowProps) => {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const {
    data: matchScoreExplanation,
    isFetching,
    error,
  } = useGetMatchScoreExplanationQuery(application.id, {
    skip: !isExplanationOpen,
  });

  return (
    <Stack
      spacing={1}
      sx={{
        py: 1.5,
        px: 1,
        mx: -1,
        borderRadius: 1,
        transition: 'background-color 90ms',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Link
            component={RouterLink}
            to={`/browse/${application.vacancyId}`}
            underline='hover'
            sx={{ fontWeight: 600 }}
          >
            {application.vacancyName
              ? capitalizeName(application.vacancyName)
              : 'View vacancy'}
          </Link>

          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            Applied {formatDate(application.createdAt)}
          </Typography>
        </Stack>

        <Stack
          direction='row'
          spacing={2}
          sx={{ alignItems: 'center', flexShrink: 0 }}
        >
          <ExpectedSalary expectedSalary={application.expectedSalary} />
          <ApplicationStatusChip submissionStatus={application.status} />

          {application.matchScore != null && (
            <Chip
              label={`Matched by: ${application.matchScore.toFixed(2)}%`}
              size='small'
            />
          )}
        </Stack>
      </Stack>

      <Button
        size='small'
        variant='text'
        aria-expanded={isExplanationOpen}
        endIcon={isExplanationOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setIsExplanationOpen((isOpen) => !isOpen)}
        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
      >
        {isExplanationOpen ? 'Hide breakdown' : 'Why this score?'}
      </Button>

      <Collapse in={isExplanationOpen} unmountOnExit>
        {isFetching && (
          <CircularProgress
            size={24}
            aria-label='Loading match score breakdown…'
          />
        )}

        {error && (
          <Alert severity='error'>
            Could not load your match score breakdown - {getErrorMessage(error)}
          </Alert>
        )}

        {matchScoreExplanation && !isFetching && (
          <MatchScoreExplanationList
            explanation={matchScoreExplanation.explanation}
          />
        )}
      </Collapse>
    </Stack>
  );
};

export default MyApplicationRow;
