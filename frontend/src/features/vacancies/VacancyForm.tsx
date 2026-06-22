import type { CreateVacancyInput } from './types';

interface VacancyProps {
  value: CreateVacancyInput;
  onChange: (form: CreateVacancyInput) => void;
}

const VacancyForm = ({ value, onChange }: VacancyProps) => {
  return (
    <>
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder='Name'
      />

      <input
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder='Description'
      />

      <input
        value={value.minSalary}
        onChange={(e) =>
          onChange({ ...value, minSalary: Number(e.target.value) })
        }
        placeholder='Min Salary'
        type='number'
      />

      <input
        value={value.maxSalary}
        onChange={(e) =>
          onChange({ ...value, maxSalary: Number(e.target.value) })
        }
        placeholder='Max Salary'
        type='number'
      />

      <input
        value={value.requiredYearsOfExperience}
        onChange={(e) =>
          onChange({
            ...value,
            requiredYearsOfExperience: Number(e.target.value),
          })
        }
        placeholder='Required Years of Experience'
        type='number'
      />

      <input
        value={value.tags?.join(', ')}
        onChange={(e) =>
          onChange({
            ...value,
            tags: e.target.value.split(',').map((tag) => tag.trim()),
          })
        }
        placeholder='Tags (comma separated)'
      />
      <br />
      <br />
    </>
  );
};

export default VacancyForm;
