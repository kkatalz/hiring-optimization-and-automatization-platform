import { User } from 'src/entities/user';
import { Vacancy } from 'src/entities/vacancy';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'vacancy_submissions' })
export class VacancySubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'vacancy_id', type: 'uuid', nullable: false })
  vacancyId: string;

  @Column({ name: 'candidate_id', type: 'uuid', nullable: false })
  candidateId: string;

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
}
