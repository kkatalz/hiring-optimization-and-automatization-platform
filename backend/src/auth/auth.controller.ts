import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { ForgotPasswordDto } from '../auth/dto/forgotPassword.dto';
import { ResetPasswordDto } from '../auth/dto/resetPassword.dto';
import { ChangeEmailDto } from '../auth/dto/changeEmail.dto';
import { ChangePasswordDto } from '../auth/dto/changePassword.dto';
import { AuthUser } from '../decorators/authUser.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';
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

  /**
   * SuperAdmin can change email for all users without tenant restriction.
   * Admin can change email only for users within their tenant, but not other tenants.
   * Recruiter can change email only for themselves.
   * Candidate can change email only for themselves.
   */
  @Roles(
    UserRole.candidate,
    UserRole.recruiter,
    UserRole.superAdmin,
    UserRole.admin,
  )
  @Patch('credentials/email/:userId')
  async changeEmail(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() changeEmailDto: ChangeEmailDto,
  ): Promise<UserDto> {
    const user = await this.authService.findUserById(userId);
    if (!user) {
      throw new HttpException(
        'User with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.tenantId)
      this.validateAdminRecruiterForCredentialsAccess(
        requester,
        user.tenantId,
        user.id,
      );
    else this.validateCandidateSuperAdminForCredentialsAccess(requester, user);

    return await this.authService.changeEmail(userId, changeEmailDto);
  }

  /**
   * SuperAdmin can change password for all users without tenant restriction.
   * Admin can change password only for users within their tenant, but not other tenants.
   * Recruiter can change password only for themselves.
   * Candidate can change password only for themselves.
   */
  @Roles(
    UserRole.candidate,
    UserRole.recruiter,
    UserRole.superAdmin,
    UserRole.admin,
  )
  @Patch('credentials/password/:userId')
  async changePassword(
    @AuthUser() requester: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserDto> {
    const user = await this.authService.findUserById(userId);
    if (!user) {
      throw new HttpException(
        'User with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.tenantId)
      this.validateAdminRecruiterForCredentialsAccess(
        requester,
        user.tenantId,
        user.id,
      );
    else this.validateCandidateSuperAdminForCredentialsAccess(requester, user);

    const isSelfChange = requester.id === userId;
    return await this.authService.changePassword(
      userId,
      changePasswordDto,
      isSelfChange,
    );
  }

  private validateAdminRecruiterForCredentialsAccess(
    requester: UserDto,
    tenantId: string,
    userId: string,
  ): void {
    if (requester.role === UserRole.superAdmin) return;

    if (requester.role === UserRole.candidate) {
      throw new ForbiddenException('You can change only your own credentials.');
    }

    if (requester.role === UserRole.admin && requester.tenantId !== tenantId) {
      throw new ForbiddenException(
        `You can access users only within your own tenant: ${requester.tenantId}, but not requested: ${tenantId}.`,
      );
    } else if (requester.role === UserRole.recruiter && requester.id !== userId)
      throw new HttpException(
        'Recruiter can change only their own fields.',
        HttpStatus.FORBIDDEN,
      );
  }

  private validateCandidateSuperAdminForCredentialsAccess(
    requester: UserDto,
    user: { id: string },
  ): void {
    if (requester.role === UserRole.superAdmin) return;

    if (requester.id !== user.id)
      throw new HttpException(
        'You can change only your own credentials.',
        HttpStatus.FORBIDDEN,
      );
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
