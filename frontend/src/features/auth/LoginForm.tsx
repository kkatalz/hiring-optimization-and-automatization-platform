import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login } from './authSlice';

interface LoginFields {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const [loginFields, setLoginFields] = useState<LoginFields>({
    email: '',
    password: '',
  });
  const { status, user, error } = useAppSelector((state) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFields({ ...loginFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(loginFields));
  };

  return (
    <section>
      <h2>Welcome!</h2>
      <h3>Please log in:</h3>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '200px',
          margin: '0 auto',
        }}
      >
        <input
          type='email'
          name='email'
          placeholder='Email'
          value={loginFields.email}
          onChange={handleChange}
        />
        <input
          type='password'
          name='password'
          placeholder='Password'
          value={loginFields.password}
          onChange={handleChange}
        />
        <button type='submit' disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {status === 'authenticated' && user && (
        <p>Logged in as: ({user.email})</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </section>
  );
};
