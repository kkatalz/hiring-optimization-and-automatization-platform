import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { UserDto } from '../user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto): Promise<UserDto> {
    return await this.authService.loginUser(loginUserDto);
  }
}
