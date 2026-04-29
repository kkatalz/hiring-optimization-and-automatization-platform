import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { User } from '../entities/user';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import sgMail from '@sendgrid/mail';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private sendGridInitialized = false;

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
    if (!this.sendGridInitialized) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
      this.sendGridInitialized = true;
    }

    const subject = 'Reset your password';
    const text = `Hi ${user.firstName},

You requested a password reset. Open this link to set a new password (expires in 30 minutes):
${resetUrl}

If you did not request this, you can ignore this email.`;

    const html = `<p>Hi ${user.firstName},</p>
<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to set a new password (expires in 30 minutes).</p>
<p>If you did not request this, you can ignore this email.</p>`;

    try {
      await sgMail.send({
        to: user.email,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject,
        text,
        html,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send reset password email',
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      );
    }
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
}
