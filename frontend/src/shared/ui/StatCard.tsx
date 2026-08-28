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
    <Card sx={{ flex: 1, textAlign: 'center', minWidth: 200 }}>
      <CardContent>
        <Typography
          variant='h5'
          component='div'
          sx={{ color: valueColor, fontWeight: 'bold' }}
        >
          {value}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;
