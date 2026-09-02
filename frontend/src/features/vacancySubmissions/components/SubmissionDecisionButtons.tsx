import { Button, Stack, type ButtonProps } from '@mui/material';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import {
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} from '@/features/vacancySubmissions/api/vacancySubmissionEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import { VacancySubmissionStatus } from '@/types';
import type { NotifyHandler } from '@/types';

const DECISIONS = {
  approve: {
    label: 'Approve',
    resultingStatus: VacancySubmissionStatus.approved,
    color: 'success',
  },
  reject: {
    label: 'Reject',
    resultingStatus: VacancySubmissionStatus.rejected,
    color: 'error',
  },
} as const;

type Decision = keyof typeof DECISIONS;

interface SubmissionDecisionButtonsProps {
  submissionId: string;
  /** Used to disable the decision that has already been made. */
  submissionStatus: VacancySubmissionStatus;
  onNotify: NotifyHandler;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

/** Approve / Reject actions for a single submission. */
const SubmissionDecisionButtons = ({
  submissionId,
  submissionStatus,
  onNotify,
  variant = 'text',
  size = 'small',
}: SubmissionDecisionButtonsProps) => {
  const [approveSubmission, { isLoading: isApproving }] =
    useApproveSubmissionMutation();
  const [rejectSubmission, { isLoading: isRejecting }] =
    useRejectSubmissionMutation();

  const isDeciding = isApproving || isRejecting;

  const handleDecision = async (decision: Decision) => {
    const { resultingStatus } = DECISIONS[decision];
    const trigger =
      decision === 'approve' ? approveSubmission : rejectSubmission;

    try {
      await trigger(submissionId).unwrap();
      onNotify(`Submission ${resultingStatus} successfully.`, 'success');
    } catch (error) {
      const message = getErrorMessage(
        error as FetchBaseQueryError | SerializedError,
      );
      onNotify(`Failed to ${decision} submission: ${message}`, 'error');
    }
  };

  return (
    <Stack direction='row' spacing={1} sx={{ justifyContent: 'center' }}>
      {(Object.keys(DECISIONS) as Decision[]).map((decision) => {
        const { label, resultingStatus, color } = DECISIONS[decision];

        return (
          <Button
            key={decision}
            variant={variant}
            color={color}
            size={size}
            disabled={isDeciding || submissionStatus === resultingStatus}
            onClick={(event) => {
              event.stopPropagation();
              handleDecision(decision);
            }}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
  );
};

export default SubmissionDecisionButtons;
