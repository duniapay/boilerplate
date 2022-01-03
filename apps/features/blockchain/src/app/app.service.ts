import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookPayloadEntity } from '../../../../../libs/tools/src/modules/common/entity/webhook.entity';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  process(txData: WebhookPayloadEntity): string {
    console.log(txData);
    return this.configService.get<string>('APP_URL');
  }
}
