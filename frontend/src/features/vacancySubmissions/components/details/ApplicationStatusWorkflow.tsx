import { VacancySubmissionStatus, type PositiveStatus } from '@/types';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';

const positiveSteps = Object.values(VacancySubmissionStatus).filter(
  (status): status is PositiveStatus => status !== 'rejected',
);

interface ApplicationStatusWorkflowProps {
  submissionStatus: VacancySubmissionStatus;
}

export const ApplicationStatusWorkflow = ({
  submissionStatus,
}: ApplicationStatusWorkflowProps) => {
  const isRejected = submissionStatus === 'rejected';

  const activeStep = isRejected
    ? positiveSteps.indexOf('interviewing')
    : positiveSteps.indexOf(submissionStatus);

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {positiveSteps.map((label, index) => {
          const isErrorStep = isRejected && index === activeStep;

          return (
            <Step key={label}>
              <StepLabel
                error={isErrorStep}
                sx={{ textTransform: 'capitalize' }}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {isRejected && (
        <Typography
          sx={{
            mt: 2,
            color: 'error.main',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Application Status: Rejected
        </Typography>
      )}
    </Box>
  );
};
