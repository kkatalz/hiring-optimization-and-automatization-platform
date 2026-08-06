import CircleIcon from '@mui/icons-material/Circle';
import { Chip, LinearProgress, Stack, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { VacancySubmission } from '../../../types';
import { formatDate } from '../../utils/formatDate';
import CandidateInfo from '../candidateProfile/CandidateInfo';
import {
  chipColorBasedOnStatus,
  progressBarColorBasedOnScore,
  themeColorsBasedOnScore,
} from '../../utils/muiColors';
import { capitalizeName } from '../../utils/formatText';
import StarIcon from '@mui/icons-material/Star';

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
                    sx={(theme) => {
                      const { bgColor } = progressBarColorBasedOnScore(
                        submission.matchScore!,
                        theme.palette,
                      );

                      return {
                        flex: 1, // Prevents collapse by telling flexbox to expand the progress bar
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

              <TableCell align='center'>
                <Chip
                  label={capitalizeName(submission.status)}
                  sx={(theme) => {
                    const { bgColor } = chipColorBasedOnStatus(
                      submission.status,
                      theme.palette,
                    );
                    return {
                      backgroundColor: bgColor,
                      color: theme.palette.getContrastText(bgColor),
                    };
                  }}
                />
              </TableCell>

              <TableCell align='center'>
                {submission.recruiterRating ? (
                  <Chip
                    label={`${submission.recruiterRating}/10`}
                    icon={<StarIcon />}
                    sx={{
                      '& .MuiChip-icon': {
                        color: 'info.main',
                      },
                    }}
                  />
                ) : (
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    Not rated
                  </Typography>
                )}
              </TableCell>
              <TableCell align='center'>
                {submission.clusterId ? (
                  <Chip
                    label={`Cluster ${submission.clusterId}`}
                    variant='outlined'
                  />
                ) : (
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    Not clustered
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
