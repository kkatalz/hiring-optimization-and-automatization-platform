import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import IconBadge from './IconBadge';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

/** One thing the platform does: a big icon, its name, and what it actually does. */
const FeatureCard = ({ icon, title, children }: FeatureCardProps) => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <IconBadge>{icon}</IconBadge>

        <Typography variant='h6' component='h3'>
          {title}
        </Typography>

        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {children}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);

export default FeatureCard;
