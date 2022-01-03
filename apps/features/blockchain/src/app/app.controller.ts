import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { WebhookPayloadEntity } from '../../../../../libs/tools/src/modules/common/entity/webhook.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Webhooks entrypoint point
   * @param payload Webhook parameters
   */
  @Post('')
  async entrypoint(@Body() payload: WebhookPayloadEntity): Promise<any> {
    return Promise.resolve(this.appService.process(payload));
  }
}
