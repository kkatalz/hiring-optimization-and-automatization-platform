import CircleIcon from '@mui/icons-material/Circle';
import StarIcon from '@mui/icons-material/Star';
import {
  Button,
  Chip,
  LinearProgress,
  Stack,
  TableFooter,
  Typography,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';
import type { Notification, VacancySubmission } from '@/types';
import {
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} from '@/features/api/api';
import { formatDate } from '@/utils/formatDate';
import { capitalizeName } from '@/utils/formatText';
import {
  chipColorBasedOnStatus,
  progressBarColorBasedOnScore,
  themeColorsBasedOnScore,
} from '@/utils/muiColors';
import CandidateInfo from '@/components/candidateProfile/CandidateInfo';
import NotificationAlert from '@/components/common/NotificationAlert';
import { CustomTablePagination } from './SubmissionTablePagination';

interface Props {
  submissions?: VacancySubmission[];
}

export const VacancySubmissionsTable = ({ submissions }: Props) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const [approveSubmission] = useApproveSubmissionMutation();
  const [rejectSubmission] = useRejectSubmissionMutation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - (submissions?.length || 0))
      : 0;

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleApprove = async (submissionId: string) => {
    try {
      await approveSubmission(submissionId).unwrap();
      setNotification({
        message: 'Submission approved successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error approving submission:', error);
      setNotification({
        message: 'Failed to approve submission.',
        severity: 'error',
      });
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      await rejectSubmission(submissionId).unwrap();
      setNotification({
        message: 'Submission rejected successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error rejecting submission:', error);
      setNotification({
        message: 'Failed to reject submission.',
        severity: 'error',
      });
    }
  };

  return (
    <TableContainer component={Paper}>
      <NotificationAlert
        notification={notification}
        onClose={() => setNotification(null)}
      />

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
            {/* Approve & Reject & View */}
            <TableCell align='center'></TableCell>
            <TableCell align='center'></TableCell>
            <TableCell align='center'></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? submissions?.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
              )
            : submissions
          )?.map((submission) => (
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
                    aria-label='Match score'
                    value={submission.matchScore ?? 0}
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
              <TableCell align='center'>
                {submission.expectedSalary != null ? (
                  `$${submission.expectedSalary}`
                ) : (
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    Not specified
                  </Typography>
                )}
              </TableCell>

              <TableCell align='center'>
                {submission.resumeAiScore != null ? (
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
                {submission.recruiterRating != null ? (
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
                {submission.clusterId != null ? (
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

              <TableCell align='center'>
                <Button
                  variant='text'
                  color='success'
                  size='small'
                  onClick={() => handleApprove(submission.id)}
                >
                  Approve
                </Button>
              </TableCell>

              <TableCell align='center'>
                <Button
                  variant='text'
                  color='error'
                  size='small'
                  onClick={() => handleReject(submission.id)}
                >
                  Reject
                </Button>
              </TableCell>

              <TableCell align='center'>
                <Button
                  variant='text'
                  size='small'
                  sx={{ color: 'info.contrastText' }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {emptyRows > 0 && (
            <tr style={{ height: 41 * emptyRows }}>
              <td colSpan={3} aria-hidden />
            </tr>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <CustomTablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={submissions?.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              slotProps={{
                select: {
                  'aria-label': 'rows per page',
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
