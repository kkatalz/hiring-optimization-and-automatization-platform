import { Alert, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useHasPermission } from '@/features/auth/model/useHasPermission';
import { useGetMyCandidateProfileQuery } from '@/features/profile/api/profileEndpoints';
import CandidateDetailsCard from '@/features/profile/components/CandidateDetailsCard';
import MyApplicationsCard from '@/features/profile/components/MyApplicationsCard';
import ProfileHeaderCard from '@/features/profile/components/ProfileHeaderCard';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import NotificationAlert from '@/shared/ui/NotificationAlert';
import type { Notification } from '@/types';

/**
 * The signed-in user's own profile.
 * Identity comes from the session, which already holds the user. Only a
 * candidate has hiring details and applications.
 */
const MyProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const can = useHasPermission();

  const [notification, setNotification] = useState<Notification | null>(null);

  const hasCandidateProfile = can('candidateProfile:getMine');

  const {
    data: candidateProfile,
    isLoading,
    error,
  } = useGetMyCandidateProfileQuery(undefined, { skip: !hasCandidateProfile });

  if (!user)
    return (
      <Alert severity='error'>
        Could not load your profile. Try signing in again.
      </Alert>
    );

  return (
    <>
      <Typography variant='h4' sx={{ fontWeight: 600, mb: 3 }}>
        My profile
      </Typography>

      <NotificationAlert
        notification={notification}
        onClose={() => setNotification(null)}
      />

      <Stack spacing={{ xs: 2, sm: 3 }}>
        <ProfileHeaderCard user={user} candidateProfile={candidateProfile} />

        {error && (
          <Alert severity='error'>
            Could not load your candidate details - {getErrorMessage(error)}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={{ xs: 2, sm: 3 }}>
              {isLoading && <Skeleton variant='rounded' height={260} />}

              {candidateProfile && (
                <CandidateDetailsCard candidateProfile={candidateProfile} />
              )}
            </Stack>
          </Grid>

          {(isLoading || candidateProfile) && (
            <Grid size={{ xs: 12, md: 7 }}>
              {isLoading ? (
                <Skeleton variant='rounded' height={320} />
              ) : (
                <MyApplicationsCard
                  submissions={candidateProfile?.submissions}
                />
              )}
            </Grid>
          )}
        </Grid>
      </Stack>
    </>
  );
};

export default MyProfilePage;
