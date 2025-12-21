import { UserRole } from 'src/entities/enums';
import { Tenant } from 'src/entities/tenant';
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

  @Column({ length: 20 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ default: false })
  deleted: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
    default: UserRole.admin,
  })
  role: UserRole;

  @Column({ nullable: true, name: 'tenant_id' })
  tenantId?: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;
}
