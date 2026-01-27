import { InterviewStatus } from './statuses.enum';
import { VacancySubmission } from './vacancySubmission';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'interviews' })
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'meet_link', type: 'text', nullable: false })
  meetLink: string;

  @Column({ name: 'scheduled_date', type: 'timestamp', nullable: false })
  scheduledDate: Date;

  @Column({ name: 'duration_minutes', type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ name: 'submission_id', type: 'uuid', nullable: false })
  submissionId: string;

  @Column({ name: 'tenant_id', nullable: true, type: 'uuid' })
  tenantId: string;

  @Column({
    type: 'text',
    default: [],
    nullable: true,
  })
  interviewersEmails: string[];

  @Column({
    name: 'candidate_email',
    type: 'text',
    nullable: false,
  })
  candidateEmail: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.scheduled,
  })
  status: InterviewStatus;

  @ManyToOne(() => VacancySubmission, (submission) => submission.interviews)
  @JoinColumn({ name: 'submission_id' })
  submission: VacancySubmission;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
