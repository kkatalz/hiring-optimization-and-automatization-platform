import { Button } from '@mui/material';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useRunClusteringMutation } from '@/features/api/api';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import type { NotifyHandler } from '@/types';

interface ReclusterVacancyButtonProps {
  vacancyId: string;
  onNotify: NotifyHandler;
}

const ReclusterVacancyButton = ({
  vacancyId,
  onNotify,
}: ReclusterVacancyButtonProps) => {
  const [runClustering, { isLoading }] = useRunClusteringMutation();

  const handleRecluster = async () => {
    try {
      await runClustering(vacancyId).unwrap();
      onNotify('Reclustering completed successfully.', 'success');
    } catch (error) {
      const message = getErrorMessage(
        error as FetchBaseQueryError | SerializedError,
      );
      onNotify(`Failed to recluster submissions: ${message}`, 'error');
    }
  };

  return (
    <Button variant='contained' onClick={handleRecluster} disabled={isLoading}>
      {isLoading ? 'Reclustering...' : 'Re-cluster'}
    </Button>
  );
};

export default ReclusterVacancyButton;
