import { baseApi } from '@/app/api/baseApi';
import type { CreateInterviewInput, Interview } from '@/types';

export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
        { type: 'Interview', id: 'LIST' },
        { type: 'Submission', id: submissionId },
      ],
    }),
  }),
});

export const { useScheduleInterviewMutation } = interviewApi;
