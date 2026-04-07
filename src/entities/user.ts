import { Exclude } from 'class-transformer';
import { Vacancy } from './vacancy';
import { UserRole } from './role.enum';
import { Tenant } from './tenant';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CandidateProfile } from './candidateProfile';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ length: 20, name: 'first_name' })
  firstName: string;

  @Column({ length: 50, name: 'last_name' })
  lastName: string;

  @Column({ default: false })
  deleted: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
    default: UserRole.candidate,
  })
  role: UserRole;

  @Column({ nullable: true, name: 'tenant_id' })
  tenantId?: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;

  @OneToMany(() => Vacancy, (vacancy) => vacancy.createdBy)
  createdVacancies?: Vacancy[];

  @OneToOne(() => CandidateProfile, (profile) => profile.user, {
    nullable: true,
  })
  candidateProfile?: CandidateProfile;
}
