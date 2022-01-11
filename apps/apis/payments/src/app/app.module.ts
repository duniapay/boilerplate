import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { EnvironmentConfigModule } from './infrastructure/config/environment-config/environment-config.module';
import { HealthController } from '@backend/tools/health/health.controller';
import { CommonModule } from '@backend/tools/modules/common/common.module';
import { TimeoutInterceptor } from '@backend/tools/modules/common/interceptor/timeout.interceptor';
import { LoggingInterceptor } from '@backend/tools/modules/common/interceptor/logging.interceptor';
import { RepositoriesModule } from './infrastructure/repositories/repositories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      isGlobal: true,
    }),
    LoggerModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nest',
      password: 'nest',
      database: 'nest',
      entities: [__dirname + './../**/**.entity{.ts,.js}'],
      subscribers: [__dirname + './../**/**/*.subscriber.{ts,js}'],
      synchronize: true,
    }),
    RavenModule,
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     if (process.env.NODE_ENV === 'development') {
    //       return {
    //         type: configService.get<string>('DB_TYPE'),
    //         host: configService.get<string>('DB_HOST'),
    //         port: configService.get<string>('DB_PORT'),
    //         username: configService.get<string>('DB_USERNAME'),
    //         password: configService.get<string>('DB_PASSWORD'),
    //         database: configService.get<string>('DB_DATABASE'),
    //         entities: [__dirname + './../**/**.entity{.ts,.js}'],
    //         subscribers: [__dirname + './../**/**/*.subscriber.{ts,js}'],
    //         synchronize: true,
    //         retryAttempts: 20,
    //       } as TypeOrmModuleAsyncOptions;
    //     }
    //     if (process.env.NODE_ENV === 'production') {
    //       /**
    //        * Use database url in production instead
    //        */
    //       return {
    //         type: configService.get<string>('DB_TYPE'),
    //         url: configService.get<string>('DATABASE_URL'),
    //         entities: [__dirname + './../**/**.entity{.ts,.js}'],
    //         subscribers: [__dirname + './../**/**/*.subscriber.{ts,js}'],
    //         synchronize: false,
    //         ssl: true,
    //         retryAttempts: 20,
    //         extra: {
    //           ssl: {
    //             rejectUnauthorized: false,
    //           },
    //         },
    //       } as TypeOrmModuleOptions;
    //     }
    //   },
    // }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        if (process.env.NODE_ENV === 'development') {
          return {
            ttl: configService.get<number>('CACHE_TTL'), // seconds
            max: configService.get<number>('CACHE_MAX'), // maximum number of items in cache
            store: redisStore,
            host: configService.get<string>('CACHE_HOST'),
            port: configService.get<number>('CACHE_PORT'),
          };
        }
        if (process.env.NODE_ENV === 'production') {
          /**
           * Use redis url in production instead
           */
          return {
            ttl: configService.get<number>('CACHE_TTL'), // seconds
            max: configService.get<number>('CACHE_MAX'), // maximum number of items in cache
            store: redisStore,
            url: configService.get<string>('REDIS_URL'),
          };
        }
      },
    }),
    // AuthModule,
    // UserModule,
    CommonModule,
    TerminusModule,
    EnvironmentConfigModule,
    TypeOrmModule,
    RepositoriesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
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
