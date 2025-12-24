import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { User } from '../entities/user';
import { UserResponseDto } from '../user/dto/userResponse.dto';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { userToUserResponseDto } from '../user/map/user.map';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async loginUser(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
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

    return userToUserResponseDto({ user, token: this.generateToken(user) });
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
