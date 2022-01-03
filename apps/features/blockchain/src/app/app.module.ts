import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { CommonModule } from '../../../../../libs/tools/src/modules/common/common.module';
import { LoggingInterceptor } from '../../../../../libs/tools/src/modules/common/interceptor/logging.interceptor';
import { TimeoutInterceptor } from '../../../../../libs/tools/src/modules/common/interceptor/timeout.interceptor';
import { HealthController } from '../../../../../libs/tools/src/health/health.controller';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { CeloModule } from '../modules/celo/celo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true,
    }),
    LoggerModule.forRoot(),
    RavenModule,
    CommonModule,
    TerminusModule,
    CeloModule,
    /// Any Others features modules here
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
