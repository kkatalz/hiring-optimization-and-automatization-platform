import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { ChangeEmailDto } from '../auth/dto/changeEmail.dto';
import { ChangePasswordDto } from '../auth/dto/changePassword.dto';
import { User } from '../entities/user';
import { Not, Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../user/dto/user.dto';
import { userToUserDto } from '../user/map/user.map';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
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
    const decoded = verify(token, process.env.JWT_REFRESH_SECRET!, {
      algorithms: ['HS256'],
    }) as {
      id: string;
      tokenType: string;
    };

    if (decoded.tokenType !== 'refresh') {
      throw new HttpException('Invalid token type.', HttpStatus.UNAUTHORIZED);
    }

    return { id: decoded.id };
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id, deleted: false } });
  }

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email, deleted: false },
    });

    if (!user) return;

    const token = this.generateResetPasswordToken(user);
    const encodedToken = encodeURIComponent(token);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodedToken}`;

    await this.sendResetPasswordEmail(user, resetUrl);
  }

  generateResetPasswordToken(user: User): string {
    return sign(
      {
        id: user.id,
        tokenType: 'reset',
      },
      process.env.JWT_RESET_PASSWORD_SECRET!,
      { expiresIn: '30m' },
    );
  }

  private async sendResetPasswordEmail(
    user: User,
    resetUrl: string,
  ): Promise<void> {
    const text = `Hi ${user.firstName},

You requested a password reset. Open this link to set a new password (expires in 30 minutes):
${resetUrl}

If you did not request this, you can ignore this email.`;

    const html = `<p>Hi ${user.firstName},</p>
<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to set a new password (expires in 30 minutes).</p>
<p>If you did not request this, you can ignore this email.</p>`;

    await this.mailService.send({
      to: user.email,
      subject: 'Reset your password',
      text,
      html,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload: { id: string };
    try {
      payload = this.verifyResetPasswordToken(token);
    } catch {
      throw new HttpException(
        'Invalid or expired token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.findUserById(payload.id);
    if (!user) {
      throw new HttpException(
        'Invalid or expired token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    user.password = await this.hash(newPassword);
    await this.userRepository.save(user);
  }

  verifyResetPasswordToken(token: string): { id: string } {
    const decoded = verify(token, process.env.JWT_RESET_PASSWORD_SECRET!, {
      algorithms: ['HS256'],
    }) as {
      id: string;
      tokenType: string;
    };

    if (decoded.tokenType !== 'reset') {
      throw new HttpException('Invalid token type.', HttpStatus.UNAUTHORIZED);
    }

    return { id: decoded.id };
  }

  async changeEmail(
    userId: string,
    changeEmailDto: ChangeEmailDto,
  ): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deleted: false },
    });
    if (!user) {
      throw new HttpException(
        'User with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const email = changeEmailDto.email;

    const userWithGivenEmail = await this.userRepository.findOne({
      where: {
        email,
        id: Not(userId),
      },
    });

    if (userWithGivenEmail) {
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
    isSelfChange: boolean,
  ): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deleted: false },
    });
    if (!user) {
      throw new HttpException(
        'User with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (isSelfChange) {
      if (!changePasswordDto.oldPassword) {
        throw new HttpException(
          'Old password is required when changing your own password.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const oldPasswordMatches = await compare(
        changePasswordDto.oldPassword,
        user.password,
      );

      if (!oldPasswordMatches) {
        throw new HttpException(
          'Old password is incorrect.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    user.password = await this.hash(changePasswordDto.password);

    const updatedUser = await this.userRepository.save(user);

    return userToUserDto({ user: updatedUser });
  }
}
