import {
  BadRequestException,
  Body,
  Injectable,
  NotAcceptableException,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entity/transaction.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UpdatePayload } from './payloads/update.payload';
import { RegisterPayload } from '../auth/payloads/register.payload';
import { UUIDType } from '../../../../../../libs/tools/src/modules/common/validator/FindOneUUID.validator';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async get(@Param() id: UUIDType) {
    return this.transactionRepository.findOne(id);
  }

  async getByUsername(username: string) {
    return await this.transactionRepository.findOne({ username: username });
  }

  async update(
    @Param() id: UUIDType,
    @Body() updatePayload: UpdatePayload,
  ): Promise<any> {
    const admin = await this.transactionRepository.findOne(id);
    const updated = Object.assign(admin, updatePayload);
    try {
      return await this.transactionRepository.save(updated);
    } catch (e) {
      throw new NotAcceptableException('Username or Email already exists!');
    }
  }

  async getAll(
    options: IPaginationOptions,
  ): Promise<Pagination<TransactionEntity>> {
    const queryBuilder = await this.transactionRepository.createQueryBuilder(
      'a',
    );
    queryBuilder.orderBy('a.updatedDate', 'DESC');
    return paginate<TransactionEntity>(queryBuilder, options);
  }

  async create(payload: RegisterPayload) {
    const user = await this.getByUsername(payload.username);
    if (user) {
      throw new NotAcceptableException(
        'Admin with provided username already created.',
      );
    }
    return await this.transactionRepository.save(
      this.transactionRepository.create(payload),
    );
  }

  async delete(@Param() id: UUIDType): Promise<any> {
    const user = await this.transactionRepository.findOne(id);
    const deleted = await this.transactionRepository.delete(id);
    if (deleted.affected === 1) {
      return { message: `Deleted ${user.username} from records` };
    } else {
      throw new BadRequestException(
        `Failed to delete a profile by the name of ${user.username}.`,
      );
    }
  }
}
