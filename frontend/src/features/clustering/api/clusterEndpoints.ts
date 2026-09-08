import { baseApi } from '@/app/api/baseApi';
import type { VacancySubmission } from '@/types';

export const clusterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * The other submissions the clustering put in the same cluster as this
     * one. The backend answers 400 while the submission has no clusterId, so
     * callers must skip this until clustering has run.
     */
    getSimilarSubmissions: builder.query<VacancySubmission[], string>({
      query: (submissionId) => ({
        url: `/clustering/similar/${submissionId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, submissionId) => [
        { type: 'Submission', id: submissionId },
      ],
    }),

    runClustering: builder.mutation<{ message: string }, string>({
      query: (vacancyId) => ({
        url: `/clustering/run/${vacancyId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Submission'],
    }),
  }),
});

export const { useGetSimilarSubmissionsQuery, useRunClusteringMutation } =
  clusterApi;
