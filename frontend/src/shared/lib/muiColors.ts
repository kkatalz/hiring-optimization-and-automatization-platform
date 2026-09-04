import { useTheme } from '@mui/material/styles';
import type { ChipProps, Palette } from '@mui/material';
import { InterviewStatus, VacancySubmissionStatus } from '../../types';

export const useChipColors = (): NonNullable<ChipProps['color']>[] => {
  const theme = useTheme();

  // Filter keys that exist in your custom palette, fallback to default MUI keys
  return [
    'default',
    theme.palette.primary ? 'primary' : 'default',
    theme.palette.secondary ? 'secondary' : 'default',
    theme.palette.error ? 'error' : 'default',
    theme.palette.info ? 'info' : 'default',
    theme.palette.success ? 'success' : 'default',
    theme.palette.warning ? 'warning' : 'default',
  ];
};

export const progressBarColorBasedOnScore = (
  score: number,
  baseThemePalette: Palette,
): { bgColor: string } => {
  const isLow = score <= 40;
  const isMedium = score <= 80;

  const bgColor = isLow
    ? baseThemePalette.secondary.main
    : isMedium
      ? baseThemePalette.info.main
      : baseThemePalette.success.main;

  return { bgColor };
};

export const aiDetectionBarColorBasedOnScore = (
  score: number,
  baseThemePalette: Palette,
): { bgColor: string } => {
  const isLow = score <= 30;
  const isMedium = score <= 70;

  const bgColor = isLow
    ? baseThemePalette.primary.main
    : isMedium
      ? baseThemePalette.info.main
      : baseThemePalette.secondary.main;

  return { bgColor };
};

/** Used for Resume AI score (Chip) */
export const themeColorsBasedOnScore = (
  score: number,
  baseThemePalette: Palette,
): { bgColor: string; textColor: string } => {
  const isLow = score <= 30;
  const isMedium = score <= 70;

  const bgColor = isLow
    ? baseThemePalette.primary.light
    : isMedium
      ? baseThemePalette.info.light
      : baseThemePalette.secondary.light;

  const textColor = isLow
    ? baseThemePalette.primary.main
    : isMedium
      ? baseThemePalette.info.main
      : baseThemePalette.secondary.main;

  return { bgColor, textColor };
};

/** Used for Interview status (Chip) */
export const chipColorsBasedOnInterviewStatus = (
  status: InterviewStatus,
  baseThemePalette: Palette,
): { bgColor: string; textColor: string } => {
  if (status === InterviewStatus.completed)
    return {
      bgColor: baseThemePalette.success.light,
      textColor: baseThemePalette.success.main,
    };

  // A canceled interview is usually just a reschedule, so it reads as
  // 'no longer relevant' (grey) rather than as an error (red)
  if (status === InterviewStatus.canceled)
    return {
      bgColor: baseThemePalette.grey[300],
      textColor: baseThemePalette.text.secondary,
    };

  return {
    bgColor: baseThemePalette.info.light,
    textColor: baseThemePalette.info.main,
  };
};

/** Used for Vacancy Submission Status (Chip) */
export const chipColorBasedOnStatus = (
  status: string,
  baseThemePalette: Palette,
): { bgColor: string } => {
  const bgColor =
    status === VacancySubmissionStatus.interviewing
      ? baseThemePalette.secondary.contrastText
      : status === VacancySubmissionStatus.pending
        ? baseThemePalette.info.light
        : status === VacancySubmissionStatus.rejected
          ? baseThemePalette.error.main
          : status === VacancySubmissionStatus.approved
            ? baseThemePalette.success.main
            : baseThemePalette.grey[300];

  return { bgColor };
};
