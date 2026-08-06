import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import type { CandidateProfile, VacancySubmission } from '../../../types';
import { capitalizeName } from '../../utils/formatText';

interface Props {
  submissions?: VacancySubmission[];
}

export const VacancySubmissionsTable = ({ submissions }: Props) => {
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
                {submission.candidateProfile && (
                  <CandidateInfo
                    candidateProfile={submission.candidateProfile}
                  />
                )}
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
                      const { bgColor, textColor } = themeColorsBasedOnScore(
                        submission.resumeAiScore!,
                        theme.palette,
                      );

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
