import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PortfoliosModule } from './modules/portfolios/portfolios.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { SavingsModule } from './modules/savings/savings.module';
import { MarketsModule } from './modules/markets/markets.module';
import { EducationModule } from './modules/education/education.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),

    // Cron jobs for recurring deposits, rebalancing, etc.
    ScheduleModule.forRoot(),

    // Database
    DatabaseModule,

    // Feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    PortfoliosModule,
    InvestmentsModule,
    SavingsModule,
    MarketsModule,
    EducationModule,
    NotificationsModule,
    ComplianceModule,
    AdminModule,
  ],
})
export class AppModule {}
