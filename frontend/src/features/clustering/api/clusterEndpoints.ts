import { baseApi } from '@/app/api/baseApi';

export const clusterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    runClustering: builder.mutation<{ message: string }, string>({
      query: (vacancyId) => ({
        url: `/clustering/run/${vacancyId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Submission'],
    }),
  }),
});

export const { useRunClusteringMutation } = clusterApi;
