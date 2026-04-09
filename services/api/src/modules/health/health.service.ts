import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly db: DatabaseService) {}

  async check(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    database: string;
  }> {
    let dbStatus = 'disconnected';

    try {
      await this.db.$queryRawUnsafe('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      this.logger.error('Database health check failed', error);
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      database: dbStatus,
    };
  }
}
