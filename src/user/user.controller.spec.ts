import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user/user.controller';
import { expect } from 'chai';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { User } from '../entities/user';
import { Tenant } from '../entities/tenant';
import { AuthService } from '../auth/auth.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User, Tenant]),
      ],
      controllers: [UserController],
      providers: [UserService, AuthService],
    }).compile();

    controller = module.get<UserController>(UserController);
    await loadDatabase({});
  });
  afterEach(() => cleanDatabase());

  it('should be defined', () => {
    expect(!!controller).to.deep.equal(true);
  });
});
