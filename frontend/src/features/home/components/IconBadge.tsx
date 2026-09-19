import { Stack } from '@mui/material';
import type { ReactNode } from 'react';

interface IconBadgeProps {
  children: ReactNode;
  size?: number;
  color?: 'primary' | 'info';
}

/**
 * A big tinted circle behind one icon. Shared by every card on the home page so
 * the icons stay the same size and colour wherever they appear.
 */
const IconBadge = ({
  children,
  size = 72,
  color = 'primary',
}: IconBadgeProps) => (
  <Stack
    aria-hidden
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: '50%',
      bgcolor: `${color}.light`,
      color: `${color}.main`,
      alignItems: 'center',
      justifyContent: 'center',
      '& .MuiSvgIcon-root': { fontSize: size * 0.55 },
    }}
  >
    {children}
  </Stack>
);

export default IconBadge;
