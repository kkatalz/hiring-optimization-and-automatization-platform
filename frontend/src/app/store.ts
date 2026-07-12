import { configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { vacancyApi } from '../features/api/vacancyApi';
import filtersReducer from '../features/filters/filterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filters: filtersReducer,
    [vacancyApi.reducerPath]: vacancyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(vacancyApi.middleware),
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
