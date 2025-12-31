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
import { userToUserDto } from '../user/map/user.map';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../entities/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,

    private readonly authService: AuthService,
  ) {}

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

  async update(
    userId: string,
    tenantId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const user = await this.findById(userId);

    await this.tenantExists(tenantId);

    await this.userExistsWithinProvidedTenant(user, tenantId);

    const userWithUpdateEmailExists = await this.userRepository.exists({
      where: { email: updateUserDto.email, tenantId, id: Not(userId) },
    });

    if (userWithUpdateEmailExists) {
      throw new HttpException(
        'User with given email already exists. Choose a different one.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.hash(
        updateUserDto.password,
      );
    }
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return userToUserDto({ user: updatedUser });
  }

  async remove(userId: string, tenantId: string): Promise<UserDto> {
    const user = await this.findById(userId);
    if (user.role === UserRole.superAdmin) {
      throw new HttpException(
        'SuperAdmin can not be removed via url.',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.tenantExists(tenantId);
    await this.userExistsWithinProvidedTenant(user, tenantId);

    user.deleted = true;

    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deleted: false },
    });
    if (!user) {
      throw new HttpException(
        'User with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
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
