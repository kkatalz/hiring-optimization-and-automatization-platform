import { baseApi } from '@/app/api/baseApi';
import { listWithin } from '@/app/api/cacheTags';
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
        { type: 'Interview', id: listWithin('SUBMISSION', submissionId) },
      ],
    }),

    getMyInterviews: builder.query<Interview[], void>({
      query: () => ({
        url: '/interviews/me',
        method: 'GET',
      }),
      providesTags: [{ type: 'Interview', id: 'LIST' }],
    }),

    // INTERVIEW MUTATIONS
    scheduleInterview: builder.mutation<Interview, CreateInterviewInput>({
      query: (createInterviewDto) => ({
        url: '/interviews',
        method: 'POST',
        body: createInterviewDto,
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: 'Interview' },
        { type: 'Submission', id: submissionId },
      ],
    }),
  }),
});

export const {
  useGetInterviewsBySubmissionIdQuery,
  useGetMyInterviewsQuery,
  useScheduleInterviewMutation,
} = interviewApi;
