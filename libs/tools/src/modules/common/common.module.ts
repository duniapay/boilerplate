import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ExistsValidator } from './validator/exists.validator';
import { UniqueValidator } from './validator/unique.validator';

@Global()
@Module({
  imports: [TerminusModule],
  exports: [TerminusModule],
  providers: [UniqueValidator, ExistsValidator],
})
export class CommonModule {}
