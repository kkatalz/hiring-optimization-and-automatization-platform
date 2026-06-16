import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../entities/user';
import { Tenant } from '../entities/tenant';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
