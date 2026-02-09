import { User } from './user';
import { VacancySubmission } from './vacancySubmission';
import { UserDto } from '../user/dto/user.dto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LanguageProficiency, TimeCommitment } from './hiring.enum';

@Entity({ name: 'vacancies' })
export class Vacancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  salary?: string;

  @Column({ name: 'tenant_id', nullable: true, type: 'uuid' })
  tenantId: string;

  @Column({ name: 'created_by_id', nullable: true, type: 'uuid' })
  createdById: string;

  @Column({
    type: 'enum',
    enum: TimeCommitment,
    name: 'time_commitment',
    nullable: true,
  })
  timeCommitment?: TimeCommitment;

  @Column({ type: 'jsonb', name: 'language_requirements', nullable: true })
  languageRequirements?: LanguageProficiency[];

  @ManyToOne(() => User, (user) => user.createdVacancies, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: UserDto;

  @OneToMany(() => VacancySubmission, (submission) => submission.vacancy)
  submissions?: VacancySubmission[];
}
