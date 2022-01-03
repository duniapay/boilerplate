import { Module } from '@nestjs/common';
import { RehiveService } from './rehive.service';

@Module({
  imports: [],
  exports: [RehiveService],
  controllers: [],
  providers: [RehiveService],
})
export class RehiveModule {}
