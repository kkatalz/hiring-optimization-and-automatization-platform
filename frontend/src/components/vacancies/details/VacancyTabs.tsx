import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Card } from '@mui/material';
import { Link, Outlet, useMatch } from 'react-router-dom';
import type { Vacancy } from '../../../../types';

interface VacancyTabsProps {
  vacancy: Vacancy;
}

export const VacancyTabs = ({ vacancy }: VacancyTabsProps) => {
  const screeningQuestionsCount = vacancy.vacancyQuestions?.length ?? 0;

  const match = useMatch('/vacancies/:vacancyId/:tab');
  const currentTab = match?.params.tab ?? 'candidates';

  return (
    <Card sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} aria-label='Vacancy sections'>
          <Tab
            value='candidates'
            label={`Candidates (${vacancy.numberOfSubmissions ?? 0})`}
            component={Link}
            to='candidates'
          />
          <Tab
            value='overview'
            label='Overview'
            component={Link}
            to='overview'
          />
          <Tab
            value='screening-questions'
            label={`Screening questions (${screeningQuestionsCount})`}
            component={Link}
            to='screening-questions'
          />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        <Outlet context={vacancy} />
      </Box>
    </Card>
  );
};
