import type { User } from './user';
import type { Question } from './question';

export interface Tenant {
  id: string;
  email: string;
  slug: string;
  deleted: boolean;
  users?: User[];
  questions?: Question[];
}
