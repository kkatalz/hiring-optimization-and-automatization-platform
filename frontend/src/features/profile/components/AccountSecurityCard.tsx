import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import type { Notification, User } from '@/types';
import ChangeEmailDialog from './ChangeEmailDialog';
import ChangePasswordDialog from './ChangePasswordDialog';
import SectionCard from './SectionCard';

interface CredentialRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  buttonLabel: string;
  onClick: () => void;
}

const CredentialRow = ({
  icon,
  label,
  value,
  buttonLabel,
  onClick,
}: CredentialRowProps) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={1.5}
    sx={{
      justifyContent: 'space-between',
      alignItems: { xs: 'stretch', sm: 'center' },
    }}
  >
    <Stack
      direction='row'
      spacing={1.5}
      sx={{ alignItems: 'center', minWidth: 0 }}
    >
      <Stack sx={{ color: 'text.secondary' }}>{icon}</Stack>
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
          {value}
        </Typography>
      </Stack>
    </Stack>

    <Button
      variant='outlined'
      size='small'
      onClick={onClick}
      sx={{ flexShrink: 0, textTransform: 'none' }}
    >
      {buttonLabel}
    </Button>
  </Stack>
);

interface AccountSecurityCardProps {
  user: User;
  onNotify: (message: string, severity: Notification['severity']) => void;
}

/** The credentials a signed-in user can change for themselves. */
const AccountSecurityCard = ({ user, onNotify }: AccountSecurityCardProps) => {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  return (
    <>
      <SectionCard title='Sign-in and security'>
        <Stack spacing={2}>
          <CredentialRow
            icon={<EmailOutlinedIcon fontSize='small' />}
            label='Email'
            value={user.email}
            buttonLabel='Change email'
            onClick={() => setIsEmailDialogOpen(true)}
          />

          <Divider />

          <CredentialRow
            icon={<LockOutlinedIcon fontSize='small' />}
            label='Password'
            value='••••••••'
            buttonLabel='Change password'
            onClick={() => setIsPasswordDialogOpen(true)}
          />
        </Stack>
      </SectionCard>

      <ChangeEmailDialog
        userId={user.id}
        currentEmail={user.email}
        open={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        onNotify={onNotify}
      />

      <ChangePasswordDialog
        userId={user.id}
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        onNotify={onNotify}
      />
    </>
  );
};

export default AccountSecurityCard;
