import { useAppSelector } from '@/app/hooks';
import { isStaff } from '@/shared/auth/roles';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import GroupsIcon from '@mui/icons-material/Groups';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PsychologyIcon from '@mui/icons-material/Psychology';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SpeedIcon from '@mui/icons-material/Speed';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import AccessCard from '../components/AccessCard';
import AudienceCard from '../components/AudienceCard';
import FeatureCard from '../components/FeatureCard';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: <FilterAltIcon />,
    title: 'Smart filtering',
    description:
      'Narrow a pile of applications by years of experience, country, city, language proficiency, the answers people gave to your screening questions, or a minimum match score. Sort what is left by submission date, expected salary, rating or score.',
  },
  {
    icon: <SpeedIcon />,
    title: 'Match score',
    description:
      'Every application is scored against the vacancy across five dimensions: screening answers, tags, languages, years of experience and salary expectations. The weight of each dimension can be tuned per vacancy, and every score keeps the explanation of how it was reached.',
  },
  {
    icon: <PsychologyIcon />,
    title: 'AI-written resume detection',
    description:
      'Uploaded resumes are read out of PDF or DOCX and checked for AI-generated text. You get one percentage for the whole document and a separate score for each sentence, so you can see which parts look written by a machine.',
  },
  {
    icon: <BubbleChartIcon />,
    title: 'Candidate clustering',
    description:
      'A k-means model groups the applications for a vacancy into clusters of similar candidates. Compare like with like instead of reading a flat list, or pick one person and pull up everybody close to them.',
  },
  {
    icon: <QuestionAnswerIcon />,
    title: 'Custom screening questions',
    description:
      'Attach your own questions to a vacancy and decide what a good answer looks like. Candidates answer them while applying, and those answers feed both the match score and the filters.',
  },
  {
    icon: <EventAvailableIcon />,
    title: 'Interview scheduling',
    description:
      'Book an interview with a date, a duration and a meeting link. The invitation is emailed to the people involved, and if the interview is called off they get the cancellation the same way.',
  },
];

const OPEN_TO_EVERYONE = [
  'Browse every open vacancy',
  'Filter the list by tags, languages and other criteria',
  'Read a full vacancy description and its requirements',
  'See the screening questions before you commit to applying',
];

const NEEDS_AN_ACCOUNT = [
  'Apply to a vacancy',
  'Keep your experience, location and languages on file',
  'Follow what happens to the applications you sent',
  'Publish and edit vacancies',
  'Score, filter, rate and cluster applicants',
  'Schedule interviews and send invitations',
];

const HomePage = () => {
  const { status, user } = useAppSelector((state) => state.auth);

  const isAuthenticated = status === 'authenticated';
  const isStaffUser = isStaff(user?.role);

  return (
    <Stack spacing={8} sx={{ pb: 6 }}>
      <Paper
        elevation={0}
        sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, bgcolor: 'primary.light' }}
      >
        <Stack spacing={3} sx={{ maxWidth: 820 }}>
          <Typography variant='h3' component='h1' sx={{ fontWeight: 700 }}>
            Hiring Platform
          </Typography>

          <Typography variant='h6' component='p' sx={{ fontWeight: 400 }}>
            A hiring platform that matches candidates to vacancies. Recruiters
            describe what a role needs, candidates apply, and every application
            arrives already scored and ranked against those requirements.
          </Typography>

          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            Instead of reading a hundred resumes in the order they landed, a
            recruiter sees the same hundred sorted by how well they fit, grouped
            into clusters of similar people, with AI-written resumes flagged.
            Candidates get the other half of that: one profile, filled in once,
            and a clear view of what happened to everything they sent.
          </Typography>

          <Stack
            direction='row'
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap', pt: 1 }}
          >
            {isStaffUser && (
              <Button
                component={Link}
                to='/vacancies'
                variant='contained'
                size='large'
              >
                Go to my vacancies
              </Button>
            )}

            <Button
              component={Link}
              to='/browse'
              variant={isStaffUser ? 'outlined' : 'contained'}
              size='large'
            >
              Browse vacancies
            </Button>

            {!isAuthenticated && (
              <>
                <Button
                  component={Link}
                  to='/register'
                  variant='outlined'
                  size='large'
                >
                  Create account
                </Button>
                <Button component={Link} to='/login' size='large'>
                  Sign in
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Who it is for. */}
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant='h4' component='h2'>
            Who it is for
          </Typography>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            The platform serves both sides of the same hiring process, and each
            side gets in a different way.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          }}
        >
          <AudienceCard
            icon={<PersonSearchIcon />}
            title='For job seekers'
            description='Look through open positions without an account, read the full description and see the screening questions before you decide. When a role is worth applying to, create a candidate account: it holds your experience, location and languages, so every application you send is already filled in, and you can follow what happens to it afterwards.'
            actions={
              <>
                <Button component={Link} to='/browse' variant='contained'>
                  Browse vacancies
                </Button>
                {!isAuthenticated && (
                  <Button component={Link} to='/register' variant='outlined'>
                    Create account
                  </Button>
                )}
              </>
            }
          />

          <AudienceCard
            icon={<GroupsIcon />}
            title='For hiring teams'
            description='Publish a vacancy, say what the role actually needs, and let applications arrive scored and sorted instead of in a pile. Recruiter accounts are created by your organisation administrator rather than signed up for, so ask them for access and then sign in.'
            actions={
              !isAuthenticated ? (
                <Button component={Link} to='/login' variant='contained'>
                  Sign in
                </Button>
              ) : (
                isStaffUser && (
                  <Button component={Link} to='/vacancies' variant='contained'>
                    Go to my vacancies
                  </Button>
                )
              )
            }
          />
        </Box>
      </Stack>

      {/* What it does. */}
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant='h4' component='h2'>
            What it does
          </Typography>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            Six things the platform does with an application once it arrives.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
          }}
        >
          {FEATURES.map(({ icon, title, description }) => (
            <FeatureCard key={title} icon={icon} title={title}>
              {description}
            </FeatureCard>
          ))}
        </Box>
      </Stack>

      {/* Browse freely, or sign in. */}
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant='h4' component='h2'>
            Do you need an account?
          </Typography>
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            Only for the parts that write something down. Looking around is open
            to everyone.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          }}
        >
          <AccessCard
            icon={<LockOpenIcon />}
            title='No account needed'
            items={OPEN_TO_EVERYONE}
            color='primary'
          />
          <AccessCard
            icon={<LockIcon />}
            title='Sign in required'
            items={NEEDS_AN_ACCOUNT}
            color='info'
          />
        </Box>

        {!isAuthenticated && (
          <Stack
            direction='row'
            spacing={2}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Button component={Link} to='/register' variant='contained'>
              Create a candidate account
            </Button>
            <Button component={Link} to='/login' variant='outlined'>
              Sign in
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default HomePage;
