import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entity/transaction.entity';
import { TransactionsController } from './transaction.controller';
import { PassportModule } from '@nestjs/passport';
import { TransactionsService } from './transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  exports: [TransactionsService],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionModule {}
