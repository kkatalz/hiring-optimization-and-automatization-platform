import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { ForgotPasswordDto } from '../auth/dto/forgotPassword.dto';
import { ResetPasswordDto } from '../auth/dto/resetPassword.dto';
import { UserDto } from '../user/dto/user.dto';
import { Request, Response } from 'express';
import { userToUserDto } from '../user/map/user.map';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const user = await this.authService.validateUser(loginUserDto);
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    this.setRefreshTokenCookie(res, refreshToken);

    return userToUserDto({ user, token: accessToken });
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    this.validateOrigin(req);

    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new HttpException(
        'Refresh token not found.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const { id } = this.authService.verifyRefreshToken(refreshToken);
      const user = await this.authService.findUserById(id);

      if (!user) {
        this.clearRefreshTokenCookie(res);
        throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
      }

      const newAccessToken = this.authService.generateAccessToken(user);
      const newRefreshToken = this.authService.generateRefreshToken(user);

      this.setRefreshTokenCookie(res, newRefreshToken);

      return { accessToken: newAccessToken };
    } catch (error) {
      this.clearRefreshTokenCookie(res);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Invalid refresh token.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    this.clearRefreshTokenCookie(res);
    return { message: 'Logged out successfully.' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return {
      message:
        'If an account with that email exists, a reset link has been sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return { message: 'Password has been reset successfully.' };
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private validateOrigin(req: Request): void {
    const allowedOrigins = process.env
      .CORS_ORIGIN!.split(',')
      .map((o) => o.trim());

    const origin = req.headers.origin;

    if (origin && !allowedOrigins.includes(origin)) {
      throw new ForbiddenException('Invalid origin.');
    }
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
    });
  }
}
