import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  type ButtonProps,
} from '@mui/material';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useState } from 'react';
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
    confirmQuestion: 'Are you sure you want to approve this submission?',
    pendingLabel: 'Approving...',
  },
  reject: {
    label: 'Reject',
    resultingStatus: VacancySubmissionStatus.rejected,
    color: 'error',
    confirmQuestion: 'Are you sure you want to reject this submission?',
    pendingLabel: 'Rejecting...',
  },
} as const;

type Decision = keyof typeof DECISIONS;

interface SubmissionDecisionButtonsProps {
  submissionId: string;
  submissionStatus: VacancySubmissionStatus;
  onNotify: NotifyHandler;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

/** Approve and Reject buttons for a single submission, each behind a confirmation. */
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

  // Which decision is waiting for confirmation, and so also which dialog is open.
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);

  const isDeciding = isApproving || isRejecting;

  const handleCloseDialog = () => {
    if (!isDeciding) {
      setPendingDecision(null);
    }
  };

  const handleConfirmDecision = async () => {
    if (!pendingDecision) return;

    const { resultingStatus } = DECISIONS[pendingDecision];
    const trigger =
      pendingDecision === 'approve' ? approveSubmission : rejectSubmission;

    try {
      await trigger(submissionId).unwrap();
      onNotify(`Submission ${resultingStatus} successfully.`, 'success');
    } catch (error) {
      const message = getErrorMessage(
        error as FetchBaseQueryError | SerializedError,
      );
      onNotify(`Failed to ${pendingDecision} submission: ${message}`, 'error');
    } finally {
      setPendingDecision(null);
    }
  };

  return (
    <>
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
                setPendingDecision(decision);
              }}
            >
              {label}
            </Button>
          );
        })}
      </Stack>

      {pendingDecision && (
        <Dialog
          open
          onClose={handleCloseDialog}
          aria-labelledby='decision-dialog-title'
          aria-describedby='decision-dialog-description'
          role='alertdialog'
        >
          <DialogTitle id='decision-dialog-title'>
            {DECISIONS[pendingDecision].label} submission
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='decision-dialog-description'>
              {DECISIONS[pendingDecision].confirmQuestion} You can change the
              decision later by choosing the other one.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
              disabled={isDeciding}
              autoFocus
              sx={{ color: 'text.primary' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDecision}
              color={DECISIONS[pendingDecision].color}
              variant='contained'
              disabled={isDeciding}
            >
              {isDeciding
                ? DECISIONS[pendingDecision].pendingLabel
                : DECISIONS[pendingDecision].label}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default SubmissionDecisionButtons;
