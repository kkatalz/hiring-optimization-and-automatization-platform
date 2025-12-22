import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { User } from '../entities/user';
import { expect } from 'chai';
import { testUsers } from '../../test/fixtures/testUsers';
import { UserRole } from '../entities/enums';
import { testTenants } from '../../test/fixtures/testTenants';
import { Tenant } from '../entities/tenant';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthModule } from '../auth/auth.module';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User, Tenant]),
        AuthModule,
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
    });
  });

  afterEach(() => cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  it('should find all users', async () => {
    const allUsers = await service.findAll();

    expect(allUsers.length).to.deep.equal(1);
  });

  describe('create', () => {
    it('should create user', async () => {
      const tenantId = testTenants[0].id;

      const createUserDto: CreateUserDto = {
        email: 'createUser@gmail.com',
        password: 'createUser',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.superAdmin,
        tenantId,
      };

      const result = await service.create(createUserDto);

      expect(result.email).to.equal(createUserDto.email);
      expect(result.tenantId).to.equal(tenantId);
      expect(result).to.not.have.property('password');
    });

    it('should throw if tenantId on user create does not exist', async () => {
      const dto: CreateUserDto = {
        email: 'noTenant@gmail.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.superAdmin,
        tenantId: '00000000-0000-0000-0000-000000000000',
      };

      try {
        await service.create(dto);
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.equal('Tenant does not exist.');
      }
    });

    it('should throw if user with email already exists in tenant', async () => {
      const tenantId = testTenants[0].id;

      const dto: CreateUserDto = {
        email: 'existing@gmail.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.superAdmin,
        tenantId,
      };

      await service.create(dto);

      try {
        await service.create(dto);
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.equal('User with given email already exists.');
      }
    });
  });
});
