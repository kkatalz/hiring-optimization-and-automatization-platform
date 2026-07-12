import {
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getErrorMessage } from '../../utils/errorMessage';
import { useSearchVacanciesQuery } from '../api/vacancyApi';
import { setPage } from '../filters/filterSlice';
import DeleteVacancyButton from './DeleteVacancyButton';
import UpdateVacancyForm from './UpdateVacancy';
import BagOfMoney from '../../assets/BagOfMoney.svg';
import Statistics from '../../assets/Statistics.svg';
import TalkingPerson from '../../assets/TalkingPerson.svg';
import type { Vacancy } from './types';

const getSalaryLabel = (vacancy: Vacancy) => {
  const { minSalary, maxSalary } = vacancy;

  if (minSalary && maxSalary) return `$${minSalary} - $${maxSalary}`;
  if (minSalary) return `$${minSalary}+`;
  if (maxSalary) return `Up to $${maxSalary}`;

  return null;
};

type Notification = {
  message: string;
  severity: 'success' | 'error';
};

export const VacanciesList = () => {
  const dispatch = useAppDispatch();

  const [notification, setNotification] = useState<Notification | null>(null);

  const appliedFilters = useAppSelector((state) => state.filters);

  const currentPage =
    typeof appliedFilters.page === 'number' ? appliedFilters.page : 1;

  const {
    data: filteredData,
    isLoading: isFilteredLoading,
    isError: isFilteredError,
    error: filteredError,
  } = useSearchVacanciesQuery({ filters: appliedFilters });

  if (isFilteredLoading) return <div>Loading...</div>;

  if (isFilteredError)
    return (
      <div>Could not load vacancies - {getErrorMessage(filteredError)}</div>
    );

  return (
    <List
      sx={{
        minWidth: '330px',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {filteredData?.data.map((vacancy, index) => (
        <ListItem key={vacancy.id} alignItems='flex-start'>
          <Card elevation={4} sx={{ width: '100%' }}>
            <CardContent>
              <Stack
                direction='row'
                sx={{
                  alignItems: 'center',
                  p: 2,
                  gap: 3,
                  justifyContent: 'space-between',
                }}
              >
                {/* Left panel */}
                <Stack spacing={1}>
                  <Stack key={index} direction='row' spacing={1}>
                    <Typography variant='h6'>{vacancy.name}</Typography>
                    {vacancy.timeCommitment && (
                      <Chip
                        label={vacancy.timeCommitment.replace('_', ' ')}
                        sx={{
                          backgroundColor:
                            index % 2 === 0
                              ? 'primary.light'
                              : 'secondary.contrastText',
                        }}
                      />
                    )}
                  </Stack>

                  <Typography variant='subtitle2' color='primary.light'>
                    {vacancy.description}
                  </Typography>

                  {/* ---- Chips ----- */}
                  <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {/* Tags */}
                    {vacancy.tags &&
                      vacancy.tags.map((tag) => (
                        <Chip key={tag} label={tag} variant='outlined' />
                      ))}
                    {/* Salary */}
                    {getSalaryLabel(vacancy) && (
                      <Chip
                        icon={
                          <img
                            src={BagOfMoney}
                            alt='Salary'
                            style={{ width: 16, height: 16 }}
                          />
                        }
                        label={getSalaryLabel(vacancy)}
                        sx={{ px: 0.5, justifyContent: 'space-between' }}
                      />
                    )}
                    {/* Experience */}
                    {vacancy.requiredYearsOfExperience !== null && (
                      <Chip
                        icon={
                          <img
                            src={Statistics}
                            alt='Experience'
                            style={{ width: 16, height: 16 }}
                          />
                        }
                        label={
                          vacancy.requiredYearsOfExperience === 0
                            ? 'No experience'
                            : `${vacancy.requiredYearsOfExperience} yrs`
                        }
                        sx={{ px: 0.5, justifyContent: 'space-between' }}
                      />
                    )}
                    {vacancy.languageRequirements &&
                      vacancy.languageRequirements.length > 0 &&
                      vacancy.languageRequirements.map((lang) => (
                        <Chip
                          key={lang.code}
                          label={`${lang.code.toUpperCase()} - ${lang.level}`}
                          icon={
                            <img
                              src={TalkingPerson}
                              alt='Language'
                              style={{ width: 16, height: 16 }}
                            />
                          }
                          sx={{ px: 0.5, justifyContent: 'space-between' }}
                        />
                      ))}
                  </Stack>
                </Stack>

                {/* Edit & Delete */}
                <Stack
                  direction='row'
                  spacing={1}
                  sx={{
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <UpdateVacancyForm
                    vacancyId={vacancy.id}
                    initialData={{
                      name: vacancy.name,
                      description: vacancy.description,
                      minSalary: vacancy.minSalary,
                      maxSalary: vacancy.maxSalary,
                      timeCommitment: vacancy.timeCommitment,
                      languageRequirements: vacancy.languageRequirements,
                      requiredYearsOfExperience:
                        vacancy.requiredYearsOfExperience,
                      tags: vacancy.tags,
                      customWeights: vacancy.customWeights,
                    }}
                  />
                  <DeleteVacancyButton
                    vacancyId={vacancy.id}
                    onNotify={(message, severity) =>
                      setNotification({ message, severity })
                    }
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </ListItem>
      ))}

      {(filteredData?.totalPages ?? 0) > 1 && appliedFilters.page && (
        <>
          <button
            disabled={appliedFilters.page <= 1}
            onClick={() => dispatch(setPage(currentPage - 1))}
          >
            Prev
          </button>
          <button
            disabled={currentPage >= (filteredData?.totalPages ?? 0)}
            onClick={() => dispatch(setPage(currentPage + 1))}
          >
            Next
          </button>
        </>
      )}

      <Snackbar
        open={notification !== null}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification ? (
          <Alert
            severity={notification.severity}
            variant='filled'
            onClose={() => setNotification(null)}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </List>
  );
};
