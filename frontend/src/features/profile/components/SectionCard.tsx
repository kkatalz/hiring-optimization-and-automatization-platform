import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

/** One titled block of the profile page, so every section reads the same. */
const SectionCard = ({ title, action, children }: SectionCardProps) => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}
    >
      <Stack
        direction='row'
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography
          variant='subtitle2'
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {title}
        </Typography>
        {action}
      </Stack>

      {children}
    </CardContent>
  </Card>
);

export default SectionCard;
