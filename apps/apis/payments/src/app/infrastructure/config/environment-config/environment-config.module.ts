import { plainToClass } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsString, validate, validateSync } from 'class-validator';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentConfigService } from './environment-config.service';

@Module({
  providers: [EnvironmentConfigService]
})

  
  @Module({
    imports: [
      ConfigModule.forRoot({
        envFilePath: './env/local.env',
        ignoreEnvFile: process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test' ? false : true,
        isGlobal: true,
        validate,
      }),
    ],
    providers: [EnvironmentConfigService],
    exports: [EnvironmentConfigService],
  })
  export class EnvironmentConfigModule {}

