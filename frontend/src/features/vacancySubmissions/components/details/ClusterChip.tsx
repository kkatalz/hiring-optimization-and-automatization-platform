import { Chip, Typography } from '@mui/material';

interface ClusterChipProps {
  clusterId?: number | null;
}

const ClusterChip = ({ clusterId }: ClusterChipProps) => {
  if (clusterId == null)
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        Not clustered
      </Typography>
    );

  return <Chip label={`Cluster ${clusterId}`} variant='outlined' />;
};

export default ClusterChip;
