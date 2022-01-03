import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RehiveService } from '../../../../../../libs/tools/src/modules/rehive/rehive.service';

@Injectable()
export class CeloService {
  constructor(
    private readonly configService: ConfigService,
    private readonly rehiveService: RehiveService,
  ) {}
}
