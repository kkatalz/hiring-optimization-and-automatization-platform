/** Returns a date string in the format 'YYYY-MM-DDTHH:mm' for use in a datetime-local input.
 *  Deliberately builds a wrong Date, so that printing it as UTC would show in in the correct local time
 */
export const toDateTimeLocalValue = (date: Date): string =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

/** Example: 3 Jul 2026 - 14:00 */
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(date)
    .replace(', ', ' · ');
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};
