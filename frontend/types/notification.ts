/**
 * Short-lived UI feedback about an action the user just took.
 * Rendered either inline (NotificationAlert) or as a Snackbar.
 */
export interface Notification {
  message: string;
  severity: 'success' | 'error';
}

/** Callback a child component uses to report an action's result to its parent. */
export type NotifyHandler = (
  message: string,
  severity: Notification['severity'],
) => void;
