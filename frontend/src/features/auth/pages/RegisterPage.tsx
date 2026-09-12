import { useAppDispatch } from '@/app/hooks';
import CandidateLanguagesPicker from '@/features/auth/components/CandidateLanguagesPicker';
import { validateNewPassword } from '@/features/auth/model/passwordPolicy';
import { login } from '@/features/auth/model/authSlice';
import { useCreateCandidateProfileMutation } from '@/features/profile/api/profileEndpoints';
import { getErrorMessage } from '@/shared/lib/errorMessage';
import PasswordField from '@/shared/ui/PasswordField';
import type { CandidateLanguageProficiency } from '@/types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

interface RegisterFields {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  yearsOfExperience: string;
  country: string;
  city: string;
}

const emptyFields: RegisterFields = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  yearsOfExperience: '',
  country: '',
  city: '',
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [fields, setFields] = useState<RegisterFields>(emptyFields);
  const [languages, setLanguages] = useState<CandidateLanguageProficiency[]>(
    [],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [createCandidateProfile, { isLoading: isCreating }] =
    useCreateCandidateProfileMutation();

  const isBusy = isCreating || isSigningIn;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const passwordError = validateNewPassword(
      fields.password,
      fields.confirmPassword,
    );
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    const yearsOfExperience = Number(fields.yearsOfExperience);
    if (!Number.isInteger(yearsOfExperience) || yearsOfExperience < 0) {
      setFormError('Years of experience must be a whole number, 0 or more.');
      return;
    }

    const email = fields.email.trim();

    // Tracked separately so a failure after this point is handled as "the
    // account exists, only the sign-in failed" rather than as a failed signup.
    let accountCreated = false;

    try {
      await createCandidateProfile({
        email,
        password: fields.password,
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        yearsOfExperience,
        country: fields.country.trim(),
        city: fields.city.trim(),
        languages,
      }).unwrap();

      accountCreated = true;

      // The endpoint answers with a profile, not a session. The visitor just
      // typed their password, so sign them in with it instead of asking twice.
      setIsSigningIn(true);
      await dispatch(login({ email, password: fields.password })).unwrap();

      navigate('/browse');
    } catch (error) {
      if (accountCreated) {
        navigate('/login', { state: { justRegistered: true } });
        return;
      }

      setFormError(
        getErrorMessage(error as FetchBaseQueryError) ||
          'Could not create your account.',
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Container maxWidth='sm' sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={1}>
          <Typography variant='h5'>Create a candidate account</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            You do not need an account to browse vacancies. You need one to
            apply and to follow what happens to your applications.
          </Typography>
        </Stack>

        <Stack
          component='form'
          onSubmit={handleSubmit}
          spacing={2}
          sx={{ mt: 3 }}
        >
          {formError && <Alert severity='error'>{formError}</Alert>}

          <TextField
            name='email'
            label='Email'
            type='email'
            size='small'
            required
            fullWidth
            autoComplete='email'
            value={fields.email}
            onChange={handleChange}
          />

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            <PasswordField
              name='password'
              label='Password'
              size='small'
              required
              fullWidth
              autoComplete='new-password'
              value={fields.password}
              onChange={handleChange}
            />
            <PasswordField
              name='confirmPassword'
              label='Confirm password'
              size='small'
              required
              fullWidth
              autoComplete='new-password'
              value={fields.confirmPassword}
              onChange={handleChange}
            />

            <TextField
              name='firstName'
              label='First name'
              size='small'
              required
              fullWidth
              autoComplete='given-name'
              slotProps={{ htmlInput: { maxLength: 20 } }}
              value={fields.firstName}
              onChange={handleChange}
            />
            <TextField
              name='lastName'
              label='Last name'
              size='small'
              required
              fullWidth
              autoComplete='family-name'
              slotProps={{ htmlInput: { maxLength: 50 } }}
              value={fields.lastName}
              onChange={handleChange}
            />

            <TextField
              name='country'
              label='Country'
              size='small'
              required
              fullWidth
              autoComplete='country-name'
              slotProps={{ htmlInput: { maxLength: 100 } }}
              value={fields.country}
              onChange={handleChange}
            />
            <TextField
              name='city'
              label='City'
              size='small'
              required
              fullWidth
              autoComplete='address-level2'
              slotProps={{ htmlInput: { maxLength: 100 } }}
              value={fields.city}
              onChange={handleChange}
            />
          </Box>

          <TextField
            name='yearsOfExperience'
            label='Years of experience'
            type='number'
            size='small'
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            value={fields.yearsOfExperience}
            onChange={handleChange}
          />

          <Divider />

          <CandidateLanguagesPicker value={languages} onChange={setLanguages} />

          <Divider />

          <Button variant='contained' type='submit' disabled={isBusy}>
            {isBusy ? 'Creating account...' : 'CREATE ACCOUNT'}
          </Button>

          <Typography
            variant='body2'
            sx={{ alignSelf: 'center', color: 'text.secondary' }}
          >
            Already have an account?{' '}
            <Link component={RouterLink} to='/login' underline='hover'>
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
