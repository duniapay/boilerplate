import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private http: HttpHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private db: TypeOrmHealthIndicator,
    @InjectConnection()
    private defaultConnection: Connection,
    private readonly dns: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      async () =>
        this.db.pingCheck('database', { connection: this.defaultConnection }),

      async () =>
        this.dns.pingCheck('google', 'https://google.com', {
          timeout: 300,
        }),
    ]);
  }
}
