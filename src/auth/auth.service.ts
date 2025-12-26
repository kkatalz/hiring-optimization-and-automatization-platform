import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { User } from '../entities/user';
import { UserDto } from '../user/dto/user.dto';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { userToUserDto } from 'src/user/map/user.map';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async loginUser(loginUserDto: LoginUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!user)
      throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);

    const matchPassword = await compare(loginUserDto.password, user.password);

    if (!matchPassword)
      throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);

    return userToUserDto({ user, token: this.generateToken(user) });
  }

  generateToken(user: User): string {
    return sign(
      {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET ?? 'test',
    );
  }

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
