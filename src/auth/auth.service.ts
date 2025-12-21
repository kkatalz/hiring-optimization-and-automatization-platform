import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { User } from 'src/entities/user';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { userToUserResponseDto } from 'src/user/map/user.map';

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
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET ?? 'test',
    );
  }
}
