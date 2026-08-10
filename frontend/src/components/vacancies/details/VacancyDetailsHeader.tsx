import { Stack } from '@mui/material';
import type { NotifyHandler, Vacancy } from '../../../../types';
import { toUpdateVacancyInput } from '../../../utils/vacancyMappers';
import ShortVacancyInfo from '../ShortVacancyInfo';
import UpdateVacancyForm from '../UpdateVacancy';
import ReclusterVacancyButton from './ReclusterVacancyButton';

interface VacancyDetailsHeaderProps {
  vacancy: Vacancy;
  onNotify: NotifyHandler;
}

const VacancyDetailsHeader = ({
  vacancy,
  onNotify,
}: VacancyDetailsHeaderProps) => {
  return (
    <Stack
      direction='row'
      sx={{
        mb: 2,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'space-between',
      }}
    >
      <ShortVacancyInfo vacancy={vacancy} index={0} showDescription={false} />

      <Stack
        direction='row'
        spacing={1}
        sx={{
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        <UpdateVacancyForm
          vacancyId={vacancy.id}
          initialData={toUpdateVacancyInput(vacancy)}
        />
        <ReclusterVacancyButton vacancyId={vacancy.id} onNotify={onNotify} />
      </Stack>
    </Stack>
  );
};

export default VacancyDetailsHeader;
