import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '../entities/role.enum';

/*
Business logic idea:
  1. Admin can only create users in their own company (e.g. recruiter gets admin's tenant id).
  2. SuperAdmin must specify which company.
*/

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;

    if (user) {
      if (user.role === UserRole.admin) {
        body.tenantId = user.tenantId;
      } else if (user.role === UserRole.superAdmin) {
        if (!body?.tenantId) {
          throw new BadRequestException('Tenant ID is required by SuperAdmin.');
        }
      }
    }

    return next.handle();
  }
}
