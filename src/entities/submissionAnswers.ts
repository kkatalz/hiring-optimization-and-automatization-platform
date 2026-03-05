import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question';
import { VacancySubmission } from './vacancySubmission';

@Entity({ name: 'submission_answers' })
export class SubmissionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'submission_id', type: 'uuid', nullable: false })
  submissionId: string;

  @Column({ name: 'question_id', type: 'uuid', nullable: false })
  questionId: string;

  @Column({ type: 'jsonb', nullable: false })
  value: string | string[];

  @ManyToOne(() => VacancySubmission, (vs) => vs.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission: VacancySubmission;

  @ManyToOne(() => Question, (q) => q.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
