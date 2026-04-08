import {
  HttpException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { AuthRequest } from '../types/expressRequest.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Please provide (correct) authorization token.',
      );
    }

    const token = req.headers.authorization.split(' ')[1];

    let decoded: { id: string };

    try {
      decoded = verify(token, process.env.JWT_ACCESS_SECRET!, {
        algorithms: ['HS256'],
      }) as { id: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    try {
      req.user = await this.userService.findById(decoded.id);
    } catch (err) {
      if (err instanceof HttpException) {
        throw new UnauthorizedException('User not found or deactivated.');
      }
      throw err;
    }

    next();
  }
}
