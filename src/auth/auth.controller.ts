import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { UserResponseDto } from '../user/dto/userResponse.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseDto> {
    return await this.authService.loginUser(loginUserDto);
  }
}
