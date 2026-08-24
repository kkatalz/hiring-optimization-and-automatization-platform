import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { getAxiosErrorMessage } from '@/utils/errorMessage';
import type { User } from '@/types';
import { vacancyApi } from '../api/api';
import api from '@/app/api/httpClient';

interface AuthState {
  user: User | null;
  status: 'authenticated' | 'unauthenticated' | 'loading' | 'checking';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'checking',
  error: null,
};

const clearSession = (state: AuthState) => {
  state.user = null;
  state.status = 'unauthenticated';
  state.error = null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { sessionCleared: clearSession },

  extraReducers: (builder) => {
    // LOGIN
    builder.addCase(login.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload;
      state.status = 'authenticated';
    });

    builder.addCase(
      login.rejected,
      (state, action: PayloadAction<string | undefined>) => {
        state.user = null;
        state.status = 'unauthenticated';
        state.error = action.payload ?? 'Login failed';
      },
    );

    // REFRESH SESSION
    builder.addCase(refreshSession.fulfilled, (state, action) => {
      state.user = action.payload;
      state.status = 'authenticated';
    });

    builder.addCase(refreshSession.rejected, (state) => {
      state.user = null;
      state.status = 'unauthenticated';
    });
  },
});

const { sessionCleared } = authSlice.actions;

export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<User>('/auth/login', credentials);
    return response.data;
  } catch (err) {
    return rejectWithValue(getAxiosErrorMessage(err, 'Login failed'));
  }
});

export const logoutSession = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await api.post('/auth/logout');
    } finally {
      dispatch(sessionCleared());
      dispatch(vacancyApi.util.resetApiState());
    }
  },
);

export const refreshSession = createAsyncThunk<User>(
  'auth/refresh',
  async () => {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
    const { id } = jwtDecode<{ id: string }>(data.accessToken);
    const user = await api.get<User>(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    });
    return { ...user.data, token: data.accessToken };
  },
);

export default authSlice.reducer;
