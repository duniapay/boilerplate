import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RehiveModule } from '../../../../../../libs/tools/src/modules/rehive/rehive.module';
import { CeloService } from './celo.service';

@Module({
  imports: [RehiveModule, ConfigModule],
  controllers: [],
  providers: [CeloService],
  exports: [],
})
export class CeloModule {}
