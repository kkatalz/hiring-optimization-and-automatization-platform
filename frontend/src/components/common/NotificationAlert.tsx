import { Alert } from '@mui/material';
import type { Notification } from '../../../types';

interface NotificationAlertProps {
  notification: Notification | null;
  onClose: () => void;
}

/** Inline success/error message. Renders nothing when there is no notification. */
const NotificationAlert = ({
  notification,
  onClose,
}: NotificationAlertProps) => {
  if (!notification) return null;

  return (
    <Alert severity={notification.severity} onClose={onClose}>
      {notification.message}
    </Alert>
  );
};

export default NotificationAlert;
