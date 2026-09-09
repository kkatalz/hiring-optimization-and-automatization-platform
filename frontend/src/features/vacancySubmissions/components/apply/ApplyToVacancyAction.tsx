import { Button, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useHasPermission } from '@/features/auth/model/useHasPermission';
import { useGetMyCandidateProfileQuery } from '@/features/profile/api/profileEndpoints';
import ApplyToVacancyDialog from './ApplyToVacancyDialog';

interface Props {
  vacancyId: string;
  vacancyName: string;
  vacancyTags?: string[];
}

/**
 * Decides what a visitor gets offered on a vacancy page:
 * a candidate who has not applied yet gets the form, one who already has is
 * told so, a signed-out visitor is pointed at the login screen, and staff get
 * nothing at all - only candidates can apply.
 */
const ApplyToVacancyAction = ({
  vacancyId,
  vacancyName,
  vacancyTags,
}: Props) => {
  const status = useAppSelector((state) => state.auth.status);
  const can = useHasPermission();

  const canApply = can('vacancySubmission:create');

  // The profile carries the candidate's own submissions, which is how we know
  // whether this vacancy has already been applied to.
  const { data: candidateProfile } = useGetMyCandidateProfileQuery(undefined, {
    skip: !canApply,
  });

  if (status === 'checking' || status === 'loading') return null;

  if (status !== 'authenticated')
    return (
      <Button variant='contained' component={Link} to='/login'>
        Sign in to apply
      </Button>
    );

  if (!canApply) return null;

  const alreadyApplied = candidateProfile?.submissions?.some(
    (submission) => submission.vacancyId === vacancyId,
  );

  if (alreadyApplied)
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
