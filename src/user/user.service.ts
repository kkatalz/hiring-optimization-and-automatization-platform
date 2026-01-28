import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../entities/user';
import { CreateUserDto } from './dto/createUser.dto';
import { UserDto } from './dto/user.dto';
import { Tenant } from '../entities/tenant';
import { userToUserDto } from './map/user.map';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../entities/role.enum';
import { ChangeEmailDto } from './dto/changeEmail.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { candidateToCandidateProfileDto } from './map/candidate.map';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { CandidateProfile } from '../entities/candidateProfile';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CandidateProfile)
    private readonly candidateProfileRepository: Repository<CandidateProfile>,

    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,

    private readonly authService: AuthService,
  ) {}

  async createCandidate(
    createCandidateDto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    const candidate = await this.userRepository.findOne({
      where: {
        firstName: createCandidateDto.firstName,
        lastName: createCandidateDto.lastName,
        email: createCandidateDto.email,
        role: UserRole.candidate,
      },
    });

    if (candidate) {
      throw new HttpException(
        'Candidate with given details already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.authService.hash(
      createCandidateDto.password,
    );

    const newCandidate = this.userRepository.create({
      email: createCandidateDto.email,
      password: hashedPassword,
      firstName: createCandidateDto.firstName,
      lastName: createCandidateDto.lastName,
      role: UserRole.candidate,
    });

    const savedCandidate = await this.userRepository.save(newCandidate);

    const candidateProfile = this.candidateProfileRepository.create({
      yearsOfExperience: createCandidateDto.yearsOfExperience,
      country: createCandidateDto.country,
      city: createCandidateDto.city,
      languages: createCandidateDto.languages,
      user: savedCandidate,
    });

    await this.candidateProfileRepository.save(candidateProfile);

    return candidateToCandidateProfileDto({
      user: {
        ...userToUserDto({ user: savedCandidate }),
        candidateProfile: candidateProfile,
      },
    });
  }

  async create(
    createUserDto: CreateUserDto,
    targetRole: UserRole,
  ): Promise<UserDto> {
    if (createUserDto.tenantId) {
      const tenant = await this.tenantRepository.exists({
        where: { id: createUserDto.tenantId },
      });

      if (!tenant) {
        throw new HttpException(
          'Tenant does not exist.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const users = await this.userRepository.find({
      where: {
        email: createUserDto.email,
        tenantId: createUserDto.tenantId,
        deleted: false,
      },
    });

    if (users.length > 0) {
      throw new HttpException(
        'User with given email already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    createUserDto.password = await this.authService.hash(
      createUserDto.password,
    );
    const newUser = this.userRepository.create({
      ...createUserDto,
      role: targetRole,
    });
    await this.userRepository.save(newUser);

    return userToUserDto({ user: newUser });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deleted: false },
      relations: ['candidateProfile'],
    });
    if (!user) {
      throw new HttpException(
        'User with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async findDtoById(id: string, requester: UserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id, deleted: false },
    });
    if (!user) {
      throw new HttpException(
        'User with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      requester.role === UserRole.admin &&
      requester.tenantId !== user.tenantId
    ) {
      throw new ForbiddenException(
        'You can access users only within your own tenant.',
      );
    }

    return userToUserDto({ user });
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: { deleted: false },
    });

    return users.map((user) => userToUserDto({ user }));
  }

  async findAllByTenantId(tenantId: string): Promise<UserDto[]> {
    await this.tenantExists(tenantId);

    const users = await this.userRepository.find({
      where: { deleted: false, tenantId },
    });

    return users.map((user) => userToUserDto({ user }));
  }

  async updateCandidate(
    candidateId: string,
    updateCandidateProfileDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    const candidateProfile = await this.candidateProfileRepository.findOne({
      where: { id: candidateId },
      relations: ['user'],
    });

    if (!candidateProfile) {
      throw new HttpException(
        'Candidate profile with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const user = await this.userRepository.findOne({
      where: {
        email: candidateProfile?.user.email,
        firstName: candidateProfile?.user.firstName,
        lastName: candidateProfile?.user.lastName,
      },
    });

    if (!user) {
      throw new HttpException(
        'User associated with candidate profile not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const { ...candidateFields } = updateCandidateProfileDto;

    Object.keys(candidateFields).forEach((key) => {
      if (candidateFields[key] !== undefined) {
        candidateProfile[key] = candidateFields[key];
      }
    });

    const updatedCandidateProfile =
      await this.candidateProfileRepository.save(candidateProfile);

    const firstName = updateCandidateProfileDto.firstName;
    const lastName = updateCandidateProfileDto.lastName;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    const savedUser = await this.userRepository.save(user);

    return candidateToCandidateProfileDto({
      user: {
        ...userToUserDto({ user: savedUser }),
        candidateProfile: updatedCandidateProfile,
      },
    });
  }

  async update(
    userId: string,
    tenantId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const user = await this.findById(userId);

    await this.tenantExists(tenantId);

    await this.userExistsWithinProvidedTenant(user, tenantId);

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return userToUserDto({ user: updatedUser });
  }

  async remove(userId: string, tenantId: string): Promise<void> {
    const user = await this.findById(userId);

    await this.tenantExists(tenantId);
    await this.userExistsWithinProvidedTenant(user, tenantId);

    user.deleted = true;

    await this.userRepository.save(user);
  }

  async changeEmail(
    userId: string,
    changeEmailDto: ChangeEmailDto,
  ): Promise<UserDto> {
    const user = await this.findById(userId);
    const email = changeEmailDto.email;

    const userWithGivenEmailWithinTheSameTenant =
      await this.userRepository.findOne({
        where: {
          email,
          tenantId: user.tenantId,
          deleted: false,
          id: Not(userId),
        },
      });

    if (userWithGivenEmailWithinTheSameTenant) {
      throw new HttpException(
        'User with given email already exists. Choose a different email.',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.email = email;

    const updatedUser = await this.userRepository.save(user);

    return userToUserDto({ user: updatedUser });
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserDto> {
    const user = await this.findById(userId);
    const password = changePasswordDto.password;

    user.password = await this.authService.hash(password);

    const updatedUser = await this.userRepository.save(user);

    return userToUserDto({ user: updatedUser });
  }

  private async tenantExists(tenantId: string): Promise<boolean> {
    const tenantExists = await this.tenantRepository.exists({
      where: { id: tenantId },
    });

    if (!tenantExists) {
      throw new HttpException('Tenant does not exist.', HttpStatus.BAD_REQUEST);
    }
    return tenantExists;
  }

  private async userExistsWithinProvidedTenant(
    user: User,
    tenantId: string,
  ): Promise<boolean> {
    const userExistsWithinProvidedTenant = await this.userRepository.exists({
      where: {
        id: user.id,
        tenantId,
      },
    });
    if (!userExistsWithinProvidedTenant) {
      throw new HttpException(
        'User with given id does not exist within provided tenant.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return userExistsWithinProvidedTenant;
  }
}
