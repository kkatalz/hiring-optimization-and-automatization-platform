import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Card } from '@mui/material';
import { Link, Outlet, useMatch } from 'react-router-dom';
import type { Vacancy } from '@/types';
import type { VacancyOutletContext } from '../../model/useVacancyOutletContext';

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
        <Tabs
          value={currentTab}
          aria-label='Vacancy sections'
          variant='scrollable'
          scrollButtons='auto'
          allowScrollButtonsMobile
        >
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
      <Box sx={{ p: { xs: 1.5, md: 3 } }}>
        <Outlet
          context={
            {
              vacancy,
              customWeights: vacancy.customWeights,
            } satisfies VacancyOutletContext
          }
        />
      </Box>
    </Card>
  );
};
