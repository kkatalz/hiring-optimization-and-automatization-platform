import { baseApi } from '@/app/api/baseApi';
import type { CreateQuestionInput, Question } from '@/types';

export const questionEndpoints = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    findAllQuestions: builder.query<Question[], { tenantId?: string } | void>({
      query: (args) => ({
        url: '/questions',
        method: 'GET',
        params: args?.tenantId ? { tenantId: args.tenantId } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((q) => ({
                type: 'Question' as const,
                id: q.id,
              })),
              { type: 'Question', id: 'LIST' },
            ]
          : [{ type: 'Question', id: 'LIST' }],
    }),

    findQuestionById: builder.query<Question, { id: string }>({
      query: ({ id }) => ({
        url: `/questions/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Question', id }],
    }),

    createQuestion: builder.mutation<
      Question,
      { tenantId?: string; body: CreateQuestionInput }
    >({
      query: ({ tenantId, body: question }) => ({
        url: '/questions',
        method: 'POST',
        params: tenantId ? { tenantId } : undefined,
        body: question,
      }),
      invalidatesTags: [{ type: 'Question', id: 'LIST' }],
    }),

    removeQuestion: builder.mutation<Question, { id: string }>({
      query: ({ id }) => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Question', id },
        { type: 'Question', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useFindAllQuestionsQuery,
  useFindQuestionByIdQuery,
  useCreateQuestionMutation,
  useRemoveQuestionMutation,
} = questionEndpoints;
