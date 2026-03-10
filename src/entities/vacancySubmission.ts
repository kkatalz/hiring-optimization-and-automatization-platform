import {
  Column,
  CreateDateColumn,
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
import { ColumnNumericTransformer } from '../utils/convertStringToNumberTransformer';
import { SentenceScore } from '../sapling/sapling.service';

@Entity({ name: 'vacancy_submissions' })
export class VacancySubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({
    name: 'comment_ai_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  commentAiScore?: number | null;

  @Column({ name: 'comment_ai_sentence_scores', type: 'jsonb', nullable: true })
  commentAiSentenceScores?: SentenceScore[] | null;

  @Column({ type: 'text', nullable: true })
  resume?: string;

  @Column({
    name: 'resume_ai_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  resumeAiScore?: number | null;

  @Column({ name: 'resume_ai_sentence_scores', type: 'jsonb', nullable: true })
  resumeAiSentenceScores?: SentenceScore[] | null;

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

  @Column({
    name: 'match_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  matchScore?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'expected_salary',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  expectedSalary?: number | null;

  @Column({ name: 'recruiter_rating', type: 'int', nullable: true })
  recruiterRating?: number | null;

  @Column({ name: 'rated_by_recruiter_id', type: 'uuid', nullable: true })
  ratedByRecruiterId?: string | null;

  @Column({ name: 'cluster_id', type: 'int', nullable: true })
  clusterId?: number | null;

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
