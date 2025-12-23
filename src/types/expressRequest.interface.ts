import { Request } from 'express';
import { UserResponseDto } from 'src/user/dto/userResponse.dto';

export interface AuthRequest extends Request {
  user?: UserResponseDto;
}
