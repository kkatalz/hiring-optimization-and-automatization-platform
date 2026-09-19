import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import IconBadge from './IconBadge';

interface AccessCardProps {
  icon: ReactNode;
  title: string;
  items: string[];
  color: 'primary' | 'info';
}

/**
 * What a visitor can do without signing in and what signing in unlocks.
 * No account needed & Sign in required block with features listed
 */
const AccessCard = ({ icon, title, items, color }: AccessCardProps) => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <IconBadge size={56} color={color}>
          {icon}
        </IconBadge>

        <Typography variant='h6' component='h3'>
          {title}
        </Typography>

        <Stack component='ul' spacing={1} sx={{ m: 0, pl: 2.5 }}>
          {items.map((item) => (
            <Typography
              key={item}
              component='li'
              variant='body2'
              sx={{ color: 'text.secondary' }}
            >
              {item}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default AccessCard;
