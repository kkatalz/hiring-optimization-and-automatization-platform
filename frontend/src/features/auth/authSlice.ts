import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../app/api';

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
  status: 'authenticated' | 'unauthenticated' | 'loading';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'unauthenticated',
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
    builder.addCase(login.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload;
      state.status = 'authenticated';
    });

    builder.addCase(login.rejected, (state, action) => {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = action.error.message ?? 'Login failed';
    });
  },
});

export const login = createAsyncThunk<
  UserDto,
  { email: string; password: string }
>('auth/login', async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
