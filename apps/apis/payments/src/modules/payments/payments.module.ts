import { Module } from '@nestjs/common';
import { GTBankCIService } from './partners/gtbank-ci/gt.bank.ci';
import { IntouchBFService } from './partners/intouch-bf/intouch.bf';
import { IntouchCIService } from './partners/intouch-ci/intouch.ci';
import { TransactionsService } from '../transactions';

@Module({
  imports: [IntouchCIService, IntouchBFService, GTBankCIService],
  exports: [TransactionsService],
  controllers: [],
  providers: [TransactionsService],
})
export class TransactionModule {}
