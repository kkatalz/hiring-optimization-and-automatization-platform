import { useOutletContext } from 'react-router-dom';
import type { CustomWeights, VacancySummary } from '../../../types';

export interface VacancyOutletContext {
  vacancy: VacancySummary;
  customWeights?: CustomWeights;
}

export const useVacancyOutletContext = () =>
  useOutletContext<VacancyOutletContext>();
