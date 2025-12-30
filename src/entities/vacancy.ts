import { User } from '../entities/user';
import { VacancySubmission } from '../entities/vacancySubmission';
import { UserDto } from '../user/dto/user.dto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ManyToOne(() => User, (user) => user.createdVacancies, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: UserDto;

  @OneToMany(() => VacancySubmission, (submission) => submission.vacancy)
  submissions?: VacancySubmission[];
}
