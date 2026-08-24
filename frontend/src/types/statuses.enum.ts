export const VacancySubmissionStatus = {
  pending: 'pending',
  interviewing: 'interviewing',
  approved: 'approved',
  rejected: 'rejected',
} as const;

export type VacancySubmissionStatus =
  (typeof VacancySubmissionStatus)[keyof typeof VacancySubmissionStatus];

export const InterviewStatus = {
  scheduled: 'scheduled',
  completed: 'completed',
  canceled: 'canceled',
} as const;

export type InterviewStatus =
  (typeof InterviewStatus)[keyof typeof InterviewStatus];
