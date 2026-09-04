import { Button, TableFooter } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';
import type { Notification, VacancySubmission } from '@/types';
import { formatDate } from '@/shared/lib/formatDate';
import CandidateInfo from '@/features/vacancySubmissions/components/CandidateInfo';
import SubmissionDecisionButtons from '@/features/vacancySubmissions/components/details/SubmissionDecisionButtons';
import NotificationAlert from '@/shared/ui/NotificationAlert';
import { CustomTablePagination } from './SubmissionTablePagination';
import { useNavigate } from 'react-router-dom';
import ApplicationStatusChip from '@/features/vacancySubmissions/components/details/ApplicationStatusChip';
import ClusterChip from '@/features/vacancySubmissions/components/details/ClusterChip';
import ExpectedSalary from '@/features/vacancySubmissions/components/details/ExpectedSalary';
import MatchScoreBar from '@/features/vacancySubmissions/components/details/MatchScoreBar';
import RecruiterRating from '@/features/vacancySubmissions/components/details/RecruiterRating';
import PercentageChip from '@/features/vacancySubmissions/components/details/PercentageChip';

interface Props {
  submissions?: VacancySubmission[];
}

export const VacancySubmissionsTable = ({ submissions }: Props) => {
  const navigate = useNavigate();

  const [notification, setNotification] = useState<Notification | null>(null);

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

  const handleShowSubmissionDetail = (
    vacancyId: string,
    submissionId: string,
  ) => {
    navigate(`/vacancies/${vacancyId}/vacancy-submissions/${submissionId}`);
  };

  return (
    <TableContainer component={Paper}>
      <NotificationAlert
        notification={notification}
        onClose={() => setNotification(null)}
      />

      <Table
        sx={{ minWidth: 650, whiteSpace: 'nowrap' }}
        aria-label='Candidate submissions'
      >
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
            {/* View */}
            <TableCell align='center'></TableCell>
            {/* Approve & Reject */}
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
                    globalDirection='row'
                    showChipOrAvatar='chip'
                  />
                )}
              </TableCell>

              <TableCell align='center' sx={{ color: 'text.secondary' }}>
                {formatDate(submission.createdAt)}
              </TableCell>

              <TableCell align='center'>
                <MatchScoreBar matchScore={submission.matchScore} />
              </TableCell>

              <TableCell align='center'>
                <ExpectedSalary expectedSalary={submission.expectedSalary} />
              </TableCell>

              <TableCell align='center'>
                <PercentageChip score={submission.resumeAiScore} label='AI' />
              </TableCell>

              <TableCell align='center'>
                <ApplicationStatusChip submissionStatus={submission.status} />
              </TableCell>

              <TableCell align='center'>
                <RecruiterRating recruiterRating={submission.recruiterRating} />
              </TableCell>
              <TableCell align='center'>
                <ClusterChip clusterId={submission.clusterId} />
              </TableCell>

              <TableCell align='center'>
                <Button
                  variant='text'
                  size='small'
                  sx={{ color: 'info.contrastText' }}
                  onClick={() =>
                    handleShowSubmissionDetail(
                      submission.vacancyId,
                      submission.id,
                    )
                  }
                >
                  View
                </Button>
              </TableCell>

              <TableCell align='center'>
                <SubmissionDecisionButtons
                  submissionId={submission.id}
                  submissionStatus={submission.status}
                  onNotify={(message, severity) =>
                    setNotification({ message, severity })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
          {emptyRows > 0 && (
            <tr style={{ height: 41 * emptyRows }}>
              <td colSpan={10} aria-hidden />
            </tr>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <CustomTablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
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
