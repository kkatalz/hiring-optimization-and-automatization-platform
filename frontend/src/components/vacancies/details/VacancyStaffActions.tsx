import type { NotifyHandler, Vacancy } from '@/types';
import { useHasPermission } from '@/features/auth/useHasPermission';
import { toUpdateVacancyInput } from '@/features/vacancies/model/vacancyMappers';
import UpdateVacancyForm from '../UpdateVacancy';
import ReclusterVacancyButton from './ReclusterVacancyButton';

interface VacancyStaffActionsProps {
  vacancy: Vacancy;
  onNotify: NotifyHandler;
}

const VacancyStaffActions = ({
  vacancy,
  onNotify,
}: VacancyStaffActionsProps) => {
  const can = useHasPermission();

  const canUpdate = can('vacancy:update');
  const canRecluster = can('clustering:runByVacancyId');

  if (!canUpdate && !canRecluster) return null;

  return (
    <>
      {canUpdate && (
        <UpdateVacancyForm
          vacancyId={vacancy.id}
          initialData={toUpdateVacancyInput(vacancy)}
        />
      )}
      {canRecluster && (
        <ReclusterVacancyButton vacancyId={vacancy.id} onNotify={onNotify} />
      )}
    </>
  );
};

export default VacancyStaffActions;
