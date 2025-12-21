import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { Tenant } from 'src/entities/tenant';
import { userToUserResponseDto } from 'src/user/map/user.map';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    let tenantExists;
    if (createUserDto.tenantId) {
      tenantExists = await this.tenantRepository.exists({
        where: { id: createUserDto.tenantId },
      });
    }

    if (tenantExists === true) {
      throw new HttpException('Tenant does not exist', HttpStatus.BAD_REQUEST);
    }

    const users = await this.userRepository.find({
      where: { email: createUserDto.email, tenantId: createUserDto.tenantId },
    });

    if (users.length > 0) {
      throw new HttpException(
        'User with given email within given tenant already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = this.userRepository.create(createUserDto);

    return await this.userRepository.save(newUser);
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

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
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
        'User with given id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }
}
