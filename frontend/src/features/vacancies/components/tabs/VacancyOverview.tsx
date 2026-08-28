import { LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useAppSelector } from '@/app/hooks';
import { progressBarColorBasedOnScore } from '@/shared/lib/muiColors';
import { useVacancyOutletContext } from '../../model/useVacancyOutletContext';

const VacancyOverview = () => {
  const { vacancy, customWeights } = useVacancyOutletContext();
  const role = useAppSelector((state) => state.auth?.user?.role);

  const vacancyWeights = [
    {
      name: 'Questions',
      vacancyWeight: customWeights?.questions ?? 0,
    },
    {
      name: 'Experience',
      vacancyWeight: customWeights?.experience ?? 0,
    },
    { name: 'Tags', vacancyWeight: customWeights?.tags ?? 0 },
    {
      name: 'Salary',
      vacancyWeight: customWeights?.salary ?? 0,
    },
    {
      name: 'Languages',
      vacancyWeight: customWeights?.languages ?? 0,
    },
  ];

  return (
    <Stack
      direction='column'
      spacing={2}
      sx={{ width: { xs: '100%', md: '60%' }, maxWidth: 600 }}
    >
      <Typography variant='subtitle1' color='textSecondary'>
        DESCRIPTION
      </Typography>

      <Typography
        variant='body1'
        sx={{
          '&.MuiTypography-root': { marginTop: 1, marginBottom: 2 },
        }}
      >
        {vacancy.description || 'No description provided.'}
      </Typography>

      {role && role !== 'candidate' && (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant='h6'>Scoring weights</Typography>
          <Typography
            variant='body1'
            color='textSecondary'
            sx={{ mt: 0.5, mb: 2 }}
          >
            How much each dimension counts toward the match score in the table.
          </Typography>

          <Stack spacing={2}>
            {vacancyWeights.map((row) => (
              <Stack
                key={row.name}
                direction='row'
                sx={{
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <Typography variant='body2' sx={{ mt: 1, minWidth: 80 }}>
                  {row.name}
                </Typography>

                <LinearProgress
                  variant='determinate'
                  aria-label={`Match score for ${row.name}`}
                  value={row.vacancyWeight ?? 0}
                  sx={(theme) => {
                    const { bgColor } = progressBarColorBasedOnScore(
                      row.vacancyWeight ?? 0,
                      theme.palette,
                    );
                    return {
                      flex: 1,
                      minWidth: 80,
                      height: 8,
                      borderRadius: 4,
                      color: bgColor,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: bgColor,
                      },
                    };
                  }}
                />
                <Typography
                  variant='body2'
                  sx={{
                    mt: 1,
                    minWidth: 40,
                    textAlign: 'right',
                  }}
                >
                  {`${row.vacancyWeight}%`}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default VacancyOverview;
