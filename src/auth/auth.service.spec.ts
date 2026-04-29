import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user';
import { Tenant } from '../entities/tenant';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { expect } from 'chai';
import * as sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import { HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { testTenants } from '../../test/fixtures/testTenants';
import { testUsers } from '../../test/fixtures/testUsers';
import { nonExistentUUIDId } from '../../test/utils';
import { ChangeEmailDto } from './dto/changeEmail.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findOne: sinon.SinonStub;
    save: sinon.SinonStub;
  };
  let sgSendStub: sinon.SinonStub;

  beforeEach(async () => {
    process.env.JWT_RESET_PASSWORD_SECRET = 'test-reset-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.SENDGRID_API_KEY = 'SG.test';
    process.env.SENDGRID_FROM_EMAIL = 'noreply@test.com';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    userRepository = {
      findOne: sinon.stub(),
      save: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    sgSendStub = sinon.stub(sgMail, 'send').resolves([
      { statusCode: 202, body: '', headers: {} } as never,
      {},
    ]);
  });

  afterEach(() => {
    sinon.restore();
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

  describe('generateResetPasswordToken / verifyResetPasswordToken', () => {
    const fakeUser = { id: 'user-123' } as User;

    it('should sign a token that verifies back to the user id', () => {
      const token = service.generateResetPasswordToken(fakeUser);
      const decoded = service.verifyResetPasswordToken(token);

      expect(decoded.id).to.equal('user-123');
    });

    it('should reject a refresh token (wrong tokenType)', () => {
      const refreshToken = sign(
        { id: fakeUser.id, tokenType: 'refresh' },
        process.env.JWT_RESET_PASSWORD_SECRET!,
        { expiresIn: '30m' },
      );

      expect(() => service.verifyResetPasswordToken(refreshToken)).to.throw(
        HttpException,
      );
    });

    it('should reject a token signed with a different secret', () => {
      const foreignToken = sign(
        { id: fakeUser.id, tokenType: 'reset' },
        'some-other-secret',
        { expiresIn: '30m' },
      );

      expect(() => service.verifyResetPasswordToken(foreignToken)).to.throw();
    });

    it('should reject an expired token', () => {
      const expiredToken = sign(
        { id: fakeUser.id, tokenType: 'reset' },
        process.env.JWT_RESET_PASSWORD_SECRET!,
        { expiresIn: '-1s' },
      );

      expect(() => service.verifyResetPasswordToken(expiredToken)).to.throw();
    });
  });

  describe('forgotPassword', () => {
    it('should silently return when user is not found', async () => {
      userRepository.findOne.resolves(null);

      await service.forgotPassword('unknown@test.com');

      expect(sgSendStub.called).to.equal(false);
    });

    it('should send an email when user exists', async () => {
      userRepository.findOne.resolves({
        id: 'u1',
        email: 'a@b.com',
        firstName: 'Ada',
      } as User);

      await service.forgotPassword('a@b.com');

      expect(sgSendStub.calledOnce).to.equal(true);
      const msg = sgSendStub.firstCall.args[0];
      expect(msg.to).to.equal('a@b.com');
      expect(msg.subject).to.equal('Reset your password');
      expect(msg.html).to.contain('Ada');
      expect(msg.html).to.contain('http://localhost:3000/reset-password?token=');
      expect(msg.text).to.contain('Ada');
    });
  });

  describe('resetPassword', () => {
    it('should hash and save the new password on a valid token', async () => {
      const user = {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'Ada',
        password: 'old-hash',
        deleted: false,
      } as User;
      userRepository.findOne.resolves(user);
      userRepository.save.resolves(user);

      const token = service.generateResetPasswordToken(user);
      await service.resetPassword(token, 'brandNewPass1');

      expect(userRepository.save.calledOnce).to.equal(true);
      const saved = userRepository.save.firstCall.args[0] as User;
      expect(saved.password).to.not.equal('old-hash');
      expect(saved.password).to.match(/^\$2[aby]\$.+/);
      const matches = await bcrypt.compare('brandNewPass1', saved.password);
      expect(matches).to.equal(true);
    });

    it('should throw on an invalid token', async () => {
      let threw = false;
      try {
        await service.resetPassword('not-a-jwt', 'newPass123');
      } catch (e) {
        threw = true;
        expect(e).to.be.instanceOf(HttpException);
      }
      expect(threw).to.equal(true);
    });

    it('should throw if the user was deleted', async () => {
      userRepository.findOne.resolves(null);
      const token = service.generateResetPasswordToken({ id: 'gone' } as User);

      let threw = false;
      try {
        await service.resetPassword(token, 'newPass123');
      } catch (e) {
        threw = true;
        expect(e).to.be.instanceOf(HttpException);
      }
      expect(threw).to.equal(true);
    });
  });
});

describe('AuthService - credentials (DB)', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User, Tenant]),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
    });
  });

  afterEach(async () => {
    sinon.restore();
    await cleanDatabase();
  });

  describe('changeEmail', () => {
    it('should change email', async () => {
      const changeEmailDto: ChangeEmailDto = {
        email: 'changed@dot.com',
      };

      const changeEmailResult = await service.changeEmail(
        testUsers[0].id,
        changeEmailDto,
      );

      expect(changeEmailResult.email).to.deep.equal('changed@dot.com');

      expect(changeEmailResult).to.not.have.property('password');
    });

    it('should allow change email if the email from changeEmailDto is the same as current user already has', async () => {
      const changeEmailDto: ChangeEmailDto = {
        email: testUsers[0].email,
      };

      const changeEmailResult = await service.changeEmail(
        testUsers[0].id,
        changeEmailDto,
      );

      expect(changeEmailResult.email).to.equal(testUsers[0].email);
    });

    it('should throw error if user with given id not found', async () => {
      const changeEmailDto: ChangeEmailDto = {
        email: testUsers[0].email,
      };

      try {
        await service.changeEmail(nonExistentUUIDId, changeEmailDto);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });

    it('should throw if user with provided email already exists', async () => {
      const changeEmailDto: ChangeEmailDto = {
        email: testUsers[0].email,
      };

      try {
        await service.changeEmail(testUsers[1].id, changeEmailDto);

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'User with given email already exists. Choose a different email.',
        );
      }
    });
  });

  describe('changePassword', () => {
    it('should change password when admin changes another user (no old password needed)', async () => {
      const plainPassword = 'my-plain-password';
      const hashedResult = 'mocked-hash-result';

      const changePasswordDto: ChangePasswordDto = {
        password: plainPassword,
      };

      const hashStub = sinon.stub(service, 'hash').resolves(hashedResult);

      await service.changePassword(testUsers[0].id, changePasswordDto, false);

      expect(hashStub.calledOnceWith(plainPassword)).to.be.true;

      const userInDb = await userRepository.findOneBy({ id: testUsers[0].id });
      expect(userInDb?.password).to.equal(hashedResult);
    });

    it('should change password when user provides correct old password (self-change)', async () => {
      const knownOldPassword = 'known-old-password';
      const hashedOldPassword = await service.hash(knownOldPassword);

      await userRepository.update(testUsers[0].id, {
        password: hashedOldPassword,
      });

      const newPassword = 'new-password';
      const hashedResult = 'mocked-hash-result';

      const changePasswordDto: ChangePasswordDto = {
        oldPassword: knownOldPassword,
        password: newPassword,
      };

      const hashStub = sinon.stub(service, 'hash').resolves(hashedResult);

      await service.changePassword(testUsers[0].id, changePasswordDto, true);

      expect(hashStub.calledOnceWith(newPassword)).to.be.true;

      const userInDb = await userRepository.findOneBy({ id: testUsers[0].id });
      expect(userInDb?.password).to.equal(hashedResult);
    });

    it('should throw if old password is missing on self-change', async () => {
      const changePasswordDto: ChangePasswordDto = {
        password: 'new-password',
      };

      try {
        await service.changePassword(testUsers[0].id, changePasswordDto, true);

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.equal(
          'Old password is required when changing your own password.',
        );
      }
    });

    it('should throw if old password is incorrect on self-change', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'wrong-password',
        password: 'new-password',
      };

      try {
        await service.changePassword(testUsers[0].id, changePasswordDto, true);

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.equal('Old password is incorrect.');
      }
    });

    it('should throw error if user with given id not found', async () => {
      const changePasswordDto: ChangePasswordDto = {
        password: 'changePassword',
      };

      try {
        await service.changePassword(
          nonExistentUUIDId,
          changePasswordDto,
          false,
        );

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });
  });
});
