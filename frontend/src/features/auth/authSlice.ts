import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import api from '../../app/api';
import { jwtDecode } from 'jwt-decode';
import { getAxiosErrorMessage } from '../../utils/errorMessage';

interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  token?: string;
}

interface AuthState {
  user: UserDto | null;
  status: 'authenticated' | 'unauthenticated' | 'loading' | 'checking';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'checking',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = null;
    },
  },

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

export const login = createAsyncThunk<
  UserDto,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<UserDto>('/auth/login', credentials);
    return response.data;
  } catch (err) {
    return rejectWithValue(getAxiosErrorMessage(err, 'Login failed'));
  }
});

export const refreshSession = createAsyncThunk<UserDto>(
  'auth/refresh',
  async () => {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
    const { id } = jwtDecode<{ id: string }>(data.accessToken);
    const user = await api.get<UserDto>(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    });
    return { ...user.data, token: data.accessToken };
  },
);

export const { logout } = authSlice.actions;

export default authSlice.reducer;
