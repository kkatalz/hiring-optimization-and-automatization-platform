import { useAppSelector } from '@/app/hooks';
import {
  useBrowseVacanciesLanguagesCodesQuery,
  useBrowseVacanciesTagsQuery,
  useGetAllVacanciesLanguagesCodesQuery,
  useGetAllVacanciesTagsQuery,
} from '@/features/vacancies/api/vacancyEndpoints';
import { isStaff } from '@/shared/auth/roles';

/**
 * Option lists for the tag and language filters.
 *
 * Staff read the tenant scoped endpoints, so they only see options from their
 * own vacancies. Everyone else reads the public ones, which is what makes the
 * filters work on the browse page where the visitor may not be signed in.
 */
export const useVacancyFilterOptions = () => {
  const role = useAppSelector((state) => state.auth.user?.role);
  const viewerIsStaff = isStaff(role);

  const { data: staffTags } = useGetAllVacanciesTagsQuery(undefined, {
    skip: !viewerIsStaff,
  });
  const { data: staffLanguageCodes } = useGetAllVacanciesLanguagesCodesQuery(
    undefined,
    { skip: !viewerIsStaff },
  );

  const { data: publicTags } = useBrowseVacanciesTagsQuery(undefined, {
    skip: viewerIsStaff,
  });
  const { data: publicLanguageCodes } = useBrowseVacanciesLanguagesCodesQuery(
    undefined,
    { skip: viewerIsStaff },
  );

  return {
    tags: (viewerIsStaff ? staffTags : publicTags) ?? [],
    languageCodes:
      (viewerIsStaff ? staffLanguageCodes : publicLanguageCodes) ?? [],
  };
};
