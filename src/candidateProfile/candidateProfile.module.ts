import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CandidateProfile } from '../entities/candidateProfile';
import { Tenant } from '../entities/tenant';
import { User } from '../entities/user';
import { UserService } from '../user/user.service';
import { CandidateProfileController } from './candidateProfile.controller';
import { CandidateProfileService } from './candidateProfile.service';
import { SaplingModule } from '../sapling/sapling.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User, CandidateProfile]),
    AuthModule,
    SaplingModule,
  ],
  controllers: [CandidateProfileController],
  providers: [CandidateProfileService, UserService],
  exports: [CandidateProfileService],
})
export class CandidateProfileModule {}
