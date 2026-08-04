import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import type { CandidateProfile, VacancySubmission } from '../../../types';
import { capitalizeName } from '../../utils/formatText';
import { Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { formatDate } from '../../utils/formatDate';
import CircleIcon from '@mui/icons-material/Circle';

const showCandidateInfo = (candidateProfile: CandidateProfile) => {
  const fullName = capitalizeName(
    candidateProfile?.firstName + ' ' + candidateProfile?.lastName,
  );

  const livingPlace = candidateProfile?.city + ', ' + candidateProfile?.country;
  const experience = candidateProfile?.yearsOfExperience + ' yrs';

  return (
    <>
      <Typography variant='subtitle2'>{fullName}</Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {livingPlace} · {experience}
      </Typography>
    </>
  );
};

interface Props {
  vacancyId: string;
  submissions?: VacancySubmission[];
}

export const VacancySubmissionsTable = ({ vacancyId, submissions }: Props) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow
            sx={{
              '& .MuiTableCell-head': {
                fontWeight: 'bold',
                color: 'text.secondary',
              },
            }}
          >
            {' '}
            <TableCell>Candidate</TableCell>
            <TableCell align='center'>Applied</TableCell>
            <TableCell align='center'>Match score</TableCell>
            <TableCell align='center'>Expected salary</TableCell>
            <TableCell align='center'>Resume AI</TableCell>
            <TableCell align='center'>Status</TableCell>
            <TableCell align='center'>Rating</TableCell>
            <TableCell align='center'>Cluster</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions?.map((submission) => (
            <TableRow
              key={submission.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component='th' scope='row'>
                {submission.candidateProfile &&
                  showCandidateInfo(submission.candidateProfile)}
              </TableCell>

              <TableCell align='center' sx={{ color: 'text.secondary' }}>
                {formatDate(submission.createdAt)}
              </TableCell>

              <TableCell align='center'>
                <Stack
                  direction='row'
                  spacing={1}
                  sx={{
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LinearProgress
                    variant='determinate'
                    aria-label='Loading…'
                    value={submission.matchScore}
                    sx={{
                      flex: 1, // Prevents collapse by telling flexbox to expand the progress bar
                      minWidth: 80,
                      height: 8,
                      borderRadius: 4,
                    }}
                  />
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {submission.matchScore}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell align='center'>${submission.expectedSalary}</TableCell>

              <TableCell align='center'>
                {submission.resumeAiScore ? (
                  <Chip
                    icon={<CircleIcon />}
                    label={`${submission.resumeAiScore}% AI`}
                    sx={(theme) => {
                      // Determine theme color keys based on score tier
                      const isLow = submission!.resumeAiScore! <= 30;
                      const isMedium = submission!.resumeAiScore! <= 70;

                      const bgColor = isLow
                        ? theme.palette.primary.light
                        : isMedium
                          ? (theme.palette.info.light ??
                            theme.palette.info.main)
                          : (theme.palette.secondary.light ??
                            theme.palette.secondary.main);

                      const textColor = isLow
                        ? (theme.palette.primary.dark ??
                          theme.palette.primary.main)
                        : isMedium
                          ? (theme.palette.info.dark ?? theme.palette.info.main)
                          : (theme.palette.secondary.dark ??
                            theme.palette.secondary.main);

                      return {
                        backgroundColor: bgColor,
                        color: textColor,
                        padding: '2px',
                        // Target the Chip icon slot directly for contrast
                        '& .MuiChip-icon': {
                          color: textColor, // Matches text for clear contrast against light background
                          fontSize: 'medium',
                        },
                      };
                    }}
                  />
                ) : (
                  <Chip label='No resume' />
                )}
              </TableCell>

              <TableCell align='center'>{submission.status}</TableCell>
              <TableCell align='center'>{submission.recruiterRating}</TableCell>
              <TableCell align='center'>{submission.clusterId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
