import { User } from './user';
import { LanguageProficiency } from './hiring.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VacancySubmission } from './vacancySubmission';

@Entity({ name: 'candidate_profiles' })
export class CandidateProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'years_of_experience', type: 'int', nullable: false })
  yearsOfExperience: number;

  @Column({ type: 'text', nullable: false })
  country: string;

  @Column({ type: 'text', nullable: false })
  city: string;

  @Column({ type: 'jsonb', nullable: false })
  languages: LanguageProficiency[];

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId?: string;

  @OneToOne(() => User, (user) => user.candidateProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => VacancySubmission,
    (submission) => submission.candidateProfile,
  )
  submissions?: VacancySubmission[];
}
