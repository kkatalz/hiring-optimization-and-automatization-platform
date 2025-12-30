import { User } from '../entities/user';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ length: 100 })
  slug: string;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => User, (user) => user.tenant, { cascade: true })
  users?: User[];
}
