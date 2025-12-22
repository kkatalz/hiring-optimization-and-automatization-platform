import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user';
import * as bcrypt from 'bcrypt';
import { expect } from 'chai';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  describe('hash', () => {
    it('should return a valid bcrypt hash', async () => {
      const password = 'mySecretPassword';

      const hashedPassword = await service.hash(password);

      expect(hashedPassword).to.not.equal(password);
      expect(hashedPassword).to.match(/^\$2[aby]\$.+/);
      const isMatch = await bcrypt.compare(password, hashedPassword);
      expect(isMatch).to.deep.equal(true);
    });

    it('should generate different hashes for the same password (salting)', async () => {
      const password = 'test';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).to.not.equal(hash2);
    });
  });
});
