import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AuthRequest } from 'src/types/expressRequest.interface';
import { UserResponseDto } from 'src/user/dto/userResponse.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      next();
      return;
    }

    const token = req.headers.authorization.split(' ')[1];
    try {
      const decode = verify(token, process.env.JWT_SECRET ?? 'test') as {
        id: string;
      };
      const id = decode.id;

      let user: UserResponseDto | undefined = undefined;
      user = await this.userService.findDtoById(id);

      if (!user) {
        next();
        return;
      }

      req.user = user;

      next();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      next();
    }
  }
}
