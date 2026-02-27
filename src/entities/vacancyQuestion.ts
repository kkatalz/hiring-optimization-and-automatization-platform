import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Question } from './question';
import { Vacancy } from './vacancy';

@Entity({ name: 'vacancy_questions' })
export class VacancyQuestion {
  @PrimaryColumn({ name: 'vacancy_id', type: 'uuid' })
  vacancyId: string;

  @PrimaryColumn({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({ name: 'expected_value', type: 'varchar', nullable: true })
  expectedValue?: string;

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.vacancyQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Vacancy;

  @ManyToOne(() => Question, (question) => question.vacancyQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
