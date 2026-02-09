import { User } from './user';
import { LanguageProficiency } from './hiring.enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToOne(() => User, (user) => user.candidateProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
