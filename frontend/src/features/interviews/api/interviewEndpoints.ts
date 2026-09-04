import { baseApi } from '@/app/api/baseApi';
import { allWithin } from '@/app/api/cacheTags';
import type { CreateInterviewInput, Interview } from '@/types';

export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // INTERVIEW QUERIES
    getInterviewsBySubmissionId: builder.query<Interview[], string>({
      query: (submissionId) => ({
        url: `/interviews/submission/${submissionId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, submissionId) => [
        { type: 'Interview', id: allWithin('SUBMISSION', submissionId) },
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
        { type: 'Interview', id: allWithin('SUBMISSION', submissionId) },
        { type: 'Submission', id: submissionId },
      ],
    }),
  }),
});

export const {
  useGetInterviewsBySubmissionIdQuery,
  useScheduleInterviewMutation,
} = interviewApi;
