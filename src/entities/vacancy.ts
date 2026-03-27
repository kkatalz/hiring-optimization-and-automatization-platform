import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserDto } from '../user/dto/user.dto';
import { LanguageProficiency, TimeCommitment } from './hiring.enum';
import { CustomWeights } from '../vacancySubmission/types/matchingScore.interface';
import { User } from './user';
import { VacancyQuestion } from './vacancyQuestion';
import { VacancySubmission } from './vacancySubmission';

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

  @Column({ name: 'required_years_of_experience', type: 'int', nullable: true })
  requiredYearsOfExperience?: number;

  @Column({ type: 'jsonb', default: [] })
  tags?: string[];

  @Column({ type: 'jsonb', name: 'custom_weights', nullable: true })
  customWeights?: CustomWeights;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'needs_reclustering',
    type: 'boolean',
    default: false,
  })
  needsReclustering: boolean;

  @ManyToOne(() => User, (user) => user.createdVacancies, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: UserDto;

  @OneToMany(() => VacancySubmission, (submission) => submission.vacancy)
  submissions?: VacancySubmission[];

  @OneToMany(() => VacancyQuestion, (vq) => vq.vacancy, { cascade: true })
  vacancyQuestions?: VacancyQuestion[];
}
