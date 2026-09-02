import { baseApi } from '@/app/api/baseApi';
import type { CreateInterviewInput, Interview } from '@/types';

/** Every interview of one submission shares the same cache entry */
const submissionInterviewsTag = (submissionId: string) => ({
  type: 'Interview' as const,
  id: `SUBMISSION_${submissionId}`,
});

export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // INTERVIEW QUERIES
    getInterviewsBySubmissionId: builder.query<Interview[], string>({
      query: (submissionId) => ({
        url: `/interviews/submission/${submissionId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, submissionId) => [
        submissionInterviewsTag(submissionId),
      ],
    }),

    // INTERVIEW MUTATIONS
    scheduleInterview: builder.mutation<Interview, CreateInterviewInput>({
      query: (createInterviewDto) => ({
        url: '/interviews',
        method: 'POST',
        body: createInterviewDto,
      }),
      // Scheduling moves a pending submission to `interviewing`,
      // so its cached copy has to be refetched as well
      invalidatesTags: (_result, _error, { submissionId }) => [
        submissionInterviewsTag(submissionId),
        { type: 'Submission', id: submissionId },
      ],
    }),
  }),
});

export const {
  useGetInterviewsBySubmissionIdQuery,
  useScheduleInterviewMutation,
} = interviewApi;
