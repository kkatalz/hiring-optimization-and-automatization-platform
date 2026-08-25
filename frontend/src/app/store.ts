import { configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import authReducer from '../features/auth/model/authSlice';
import { vacancyFiltersSlice } from '../features/vacancies/model/vacancyFiltersSlice';
import { submissionFiltersSlice } from '../features/vacancySubmissions/model/submissionFiltersSlice';
import { baseApi } from '@/app/api/baseApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vacancyFilters: vacancyFiltersSlice.reducer,
    submissionFilters: submissionFiltersSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
