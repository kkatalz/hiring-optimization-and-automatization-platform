import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { User } from '../entities/user';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email, deleted: false },
    });

    if (!user)
      throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);

    const matchPassword = await compare(loginUserDto.password, user.password);

    if (!matchPassword)
      throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);

    return user;
  }

  generateAccessToken(user: User): string {
    return sign(
      {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' },
    );
  }

  generateRefreshToken(user: User): string {
    return sign(
      {
        id: user.id,
        tokenType: 'refresh',
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' },
    );
  }

  verifyRefreshToken(token: string): { id: string } {
    const decoded = verify(token, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      tokenType: string;
    };

    if (decoded.tokenType !== 'refresh') {
      throw new HttpException('Invalid token type.', HttpStatus.UNAUTHORIZED);
    }

    return { id: decoded.id };
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
