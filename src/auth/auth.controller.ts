import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
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

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
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
