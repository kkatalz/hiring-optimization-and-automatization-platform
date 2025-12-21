import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { User } from 'src/entities/user';
import { UserDto } from 'src/user/dto/user.dto';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';

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
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const matchPassword = await compare(loginUserDto.password, user.password);

    if (!matchPassword)
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    return await this.generateUserResponse(user);
  }

  private generateToken(user: UserDto): string {
    return sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
