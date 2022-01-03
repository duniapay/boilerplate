import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transaction.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { TransactionEntity } from './entity/transaction.entity';
import { UpdatePayload } from './payloads/update.payload';
import { Public } from '../../../../../../libs/tools/src/modules/common/decorator/public.decorator';
import { UUIDType } from '../../../../../../libs/tools/src/modules/common/validator/FindOneUUID.validator';

@Controller('/transaction')
@ApiTags('Transaction')
export class TransactionsController {
  /**
   * Transaction controller constructor
   * @param transactionService transaction service
   */
  constructor(private readonly transactionService: TransactionsService) {}

  /**
   * Public endpoints (Marked by @Public() ) all users with pagination options
   * @param page page number
   * @param limit items limit
   */
  @Public()
  @Get()
  @ApiQuery({ name: 'page', required: true, example: '0' })
  @ApiQuery({ name: 'limit', required: true, example: '0' })
  @ApiResponse({ status: 200, description: 'Successful Request' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<Pagination<TransactionEntity>> {
    limit = limit > 100 ? 100 : limit;
    return await this.transactionService.getAll({
      page,
      limit,
    });
  }

  /**
   * Get transaction by id
   * @param id id in UUID
   */
  @ApiBearerAuth()
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successful ' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserById(@Param() id: UUIDType): Promise<any> {
    return await this.transactionService.get(id);
  }

  /**
   * Update transaction by Id
   * @param id id in UUID
   * @param updatePayload update payload with optional parameters
   */
  @ApiBearerAuth()
  @Put(':id')
  @ApiResponse({ status: 200, description: 'Successful ' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param() id: UUIDType,
    @Body() updatePayload: UpdatePayload,
  ): Promise<any> {
    return await this.transactionService.update(id, updatePayload);
  }

  /**
   * Delete transaction by Id
   * @param id id in UUID
   */
  @ApiBearerAuth()
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Delete Transaction Request Received',
  })
  @ApiResponse({
    status: 400,
    description: 'Delete Transaction Request Failed',
  })
  async delete(@Param() id: UUIDType): Promise<any> {
    return await this.transactionService.delete(id);
  }
}
