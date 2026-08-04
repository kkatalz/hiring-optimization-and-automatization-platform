import { Card, CardContent, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: number;
  valueColor?: string;
}

const StatCard = ({
  label,
  value,
  valueColor = 'text.primary',
}: StatCardProps) => {
  return (
    <Card sx={{ minWidth: 200 }}>
      <CardContent>
        <Typography
          variant='h5'
          component='div'
          sx={{ color: valueColor, fontWeight: 'bold' }}
        >
          {value}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;
