import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import IconBadge from './IconBadge';

interface AudienceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  actions: ReactNode; // The buttons that take this audience where they need to go.
}

const AudienceCard = ({
  icon,
  title,
  description,
  actions,
}: AudienceCardProps) => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent sx={{ p: 3, height: '100%' }}>
      <Stack spacing={2} sx={{ height: '100%', alignItems: 'flex-start' }}>
        <IconBadge>{icon}</IconBadge>

        <Typography variant='h6' component='h3'>
          {title}
        </Typography>

        <Typography
          variant='body2'
          sx={{ color: 'text.secondary', flexGrow: 1 }}
        >
          {description}
        </Typography>

        <Stack
          direction='row'
          spacing={1}
          useFlexGap
          sx={{ flexWrap: 'wrap', pt: 1 }}
        >
          {actions}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default AudienceCard;
