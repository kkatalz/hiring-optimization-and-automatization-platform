import { UserRole } from '../entities/role.enum';
import { Tenant } from '../entities/tenant';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

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
}
