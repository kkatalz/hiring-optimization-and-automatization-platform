import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { Tenant } from 'src/entities/tenant';
import { userToUserResponseDto } from 'src/user/map/user.map';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    if (createUserDto.tenantId) {
      const tenantExists = await this.tenantRepository.exists({
        where: { id: createUserDto.tenantId },
      });

      if (!tenantExists) {
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

    createUserDto.password = await this.hashPassword(createUserDto.password);
    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);

    return userToUserResponseDto({ user: newUser });
  }

  async findDtoById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id, deleted: false },
    });
    if (!user) {
      throw new HttpException(
        'User with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return userToUserResponseDto({ user });
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      where: { deleted: false },
    });

    return users.map((user) => userToUserResponseDto({ user }));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findById(id);

    const userWithUpdateEmailExists = await this.userRepository.exists({
      where: { email: updateUserDto.email },
    });

    if (userWithUpdateEmailExists) {
      throw new HttpException(
        'User with given email already exists. Choose a different one.',
        HttpStatus.BAD_REQUEST,
      );
    }

    updateUserDto.password = await this.hashPassword(updateUserDto.password);
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return userToUserResponseDto({ user: updatedUser });
  }

  async remove(id: string): Promise<UserResponseDto> {
    const user = await this.findById(id);

    user.deleted = true;

    return await this.userRepository.save(user);
  }

  private async findById(id: string): Promise<User> {
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

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
}
