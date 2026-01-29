import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from './tenant/tenant.module';
import ormconfig from './ormconfig';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/guards/roles.guard';
import { VacancyModule } from 'src/vacancy/vacancy.module';
import { VacancySubmissionModule } from './vacancySubmission/vacancySubmission.module';
import { InterviewModule } from 'src/interview/interview.module';
import { CandidateProfileModule } from 'src/candidateProfile/candidate-profile/candidateProfile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormconfig),
    TenantModule,
    UserModule,
    CandidateProfileModule,
    AuthModule,
    VacancyModule,
    VacancySubmissionModule,
    InterviewModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
