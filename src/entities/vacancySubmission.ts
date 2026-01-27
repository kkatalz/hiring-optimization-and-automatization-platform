import { User } from './user';
import { Vacancy } from './vacancy';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VacancySubmissionStatus } from './status.enum';
import { Interview } from './interview';

@Entity({ name: 'vacancy_submissions' })
export class VacancySubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

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

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.submissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Vacancy;

  @ManyToOne(() => User, (candidate) => candidate.applications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidate_id' })
  candidate: User;

  @OneToMany(() => Interview, (interview) => interview.submission)
  interviews?: Interview[];
}
