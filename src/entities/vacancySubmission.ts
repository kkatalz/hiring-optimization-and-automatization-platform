import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CandidateProfile } from './candidateProfile';
import { Interview } from './interview';
import { VacancySubmissionStatus } from './statuses.enum';
import { SubmissionAnswer } from './submissionAnswers';
import { Vacancy } from './vacancy';

@Entity({ name: 'vacancy_submissions' })
export class VacancySubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ name: 'vacancy_id', type: 'uuid', nullable: false })
  vacancyId: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ name: 'candidate_id', type: 'uuid', nullable: false })
  candidateId: string;

  @Column('enum', {
    enum: VacancySubmissionStatus,
    default: VacancySubmissionStatus.pending,
  })
  status: VacancySubmissionStatus;

  @Column({ type: 'jsonb', default: [] })
  tags?: string[];

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.submissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy?: Vacancy;

  @ManyToOne(() => CandidateProfile, (profile) => profile.submissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidateProfile?: CandidateProfile;

  @OneToMany(() => Interview, (interview) => interview.submission)
  interviews?: Interview[];

  @OneToMany(() => SubmissionAnswer, (sa) => sa.submission)
  answers?: SubmissionAnswer[];
}
