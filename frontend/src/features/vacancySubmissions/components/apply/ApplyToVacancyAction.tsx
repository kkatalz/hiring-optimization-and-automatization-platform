import { Button, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useHasPermission } from '@/features/auth/model/useHasPermission';
import { useMyVacancySubmission } from '@/features/vacancySubmissions/model/useMyVacancySubmission';
import ApplyToVacancyDialog from './ApplyToVacancyDialog';

interface Props {
  vacancyId: string;
  vacancyName: string;
  vacancyTags?: string[];
}

/**
 * Decides what a visitor gets offered on a vacancy page:
 * - a candidate who has not applied yet gets the form,
 * - one who already has is told so,
 * - a signed-out visitor is pointed at the login screen,
 * - and staff get nothing - only candidates can apply.
 */
const ApplyToVacancyAction = ({
  vacancyId,
  vacancyName,
  vacancyTags,
}: Props) => {
  const status = useAppSelector((state) => state.auth.status);
  const { hasApplied } = useMyVacancySubmission(vacancyId);

  const can = useHasPermission();
  const canApply = can('vacancySubmission:create');

  if (status === 'checking' || status === 'loading') return null;

  if (status !== 'authenticated')
    return (
      <Button variant='contained' component={Link} to='/login'>
        Sign in to apply
      </Button>
    );

  if (!canApply) return null;

  if (hasApplied)
    return <Chip label='Already applied' color='success' variant='outlined' />;

  return (
    <ApplyToVacancyDialog
      vacancyId={vacancyId}
      vacancyName={vacancyName}
      vacancyTags={vacancyTags}
    />
  );
};

export default ApplyToVacancyAction;
