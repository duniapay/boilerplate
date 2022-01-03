import { Injectable } from '@nestjs/common';

import { RehiveService } from '../../../../../../libs/tools/src/modules/rehive/rehive.service';
import { IntouchCIService } from './partners/intouch-ci/intouch.ci';
import { IntouchBFService } from './partners/intouch-bf/intouch.bf';
import { GTBankCIService } from './partners/gtbank-ci/gt.bank.ci';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly rehiveService: RehiveService,
    private readonly intouchCI: IntouchCIService,
    private readonly intouchBF: IntouchBFService,
    private readonly gtbank: GTBankCIService,
  ) {}
}
