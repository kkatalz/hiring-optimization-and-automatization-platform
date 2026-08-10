import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import type { Vacancy, VacancySubmission } from '../../../../types';
import { Card } from '@mui/material';
import { VacancySubmissionsTable } from '../../vacancySubmissions/VacancySubmissionsTable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface VacancyTabsProps {
  vacancy: Vacancy;
  submissions?: VacancySubmission[];
}
export const VacancyTabs = ({ vacancy, submissions }: VacancyTabsProps) => {
  const screeningQuestionsCount = vacancy.vacancyQuestions?.length ?? 0;

  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Card sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='basic tabs example'
        >
          <Tab
            label={`Candidates (${vacancy.numberOfSubmissions ?? 0} )`}
            {...a11yProps(0)}
          />
          <Tab label='Overview' {...a11yProps(1)} />
          <Tab
            label={`Screening questions (${screeningQuestionsCount})`}
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <VacancySubmissionsTable submissions={submissions} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
    </Card>
  );
};
