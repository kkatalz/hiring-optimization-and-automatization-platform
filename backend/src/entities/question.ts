import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionType } from './question.enum';
import { SubmissionAnswer } from './submissionAnswers';
import { VacancyQuestion } from './vacancyQuestion';
import { Tenant } from './tenant';

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

  @Column({ type: 'jsonb', nullable: true, default: [] })
  answerOptions?: string[];

  @OneToMany(() => VacancyQuestion, (vq) => vq.question)
  vacancyQuestions: VacancyQuestion[];

  @OneToMany(() => SubmissionAnswer, (sa) => sa.question, { nullable: true })
  answers?: SubmissionAnswer[];

  @ManyToOne(() => Tenant, (tenant) => tenant.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
