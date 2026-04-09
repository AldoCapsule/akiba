import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Public } from '../auth/jwt-auth.guard';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns API and database health status' })
  @ApiOkResponse({
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-04-08T12:00:00.000Z' },
        version: { type: 'string', example: '0.1.0' },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  async check() {
    return this.healthService.check();
  }
}
