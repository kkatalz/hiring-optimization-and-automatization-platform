import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

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
