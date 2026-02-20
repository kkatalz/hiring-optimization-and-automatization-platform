import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionType } from './question.enum';
import { SubmissionAnswer } from './submissionAnswers';
import { VacancyQuestion } from './vacancyQuestion';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ type: 'varchar', nullable: false })
  label: string;

  @Column({ type: 'enum', enum: QuestionType, nullable: false })
  type: QuestionType;

  @Column({ type: 'jsonb', nullable: true, default: null })
  answerOptions?: string[] | null;

  @OneToMany(() => VacancyQuestion, (vq) => vq.question)
  vacancyQuestions: VacancyQuestion[];

  @OneToMany(() => SubmissionAnswer, (sa) => sa.question, { nullable: true })
  answers?: SubmissionAnswer[];
}
