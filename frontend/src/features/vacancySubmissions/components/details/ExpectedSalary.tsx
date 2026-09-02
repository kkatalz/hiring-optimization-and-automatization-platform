import { Typography } from '@mui/material';

interface ExpectedSalaryProps {
  expectedSalary?: number | null;
}

const ExpectedSalary = ({ expectedSalary }: ExpectedSalaryProps) => {
  if (expectedSalary == null)
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        Not specified
      </Typography>
    );

  return (
    <Typography variant='body2'>
      ${expectedSalary.toLocaleString('en-US')}
    </Typography>
  );
};

export default ExpectedSalary;
