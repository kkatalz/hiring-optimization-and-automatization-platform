import { baseApi } from '@/app/api/baseApi';
import { ALL } from '@/app/api/cacheTags';
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
              { type: 'Question', id: ALL },
            ]
          : [{ type: 'Question', id: ALL }],
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
      invalidatesTags: [{ type: 'Question', id: ALL }],
    }),

    removeQuestion: builder.mutation<Question, { id: string }>({
      query: ({ id }) => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      // `vacancy_questions` cascades on delete, so the question also vanishes
      // from the question list of every vacancy that used it. Which vacancies
      // those are is not known here, so every `Question` entry is invalidated.
      invalidatesTags: ['Question'],
    }),
  }),
});

export const {
  useFindAllQuestionsQuery,
  useFindQuestionByIdQuery,
  useCreateQuestionMutation,
  useRemoveQuestionMutation,
} = questionEndpoints;
