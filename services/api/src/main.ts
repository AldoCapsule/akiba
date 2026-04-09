import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

// BigInt JSON serialization — Prisma uses BigInt for FCFA amounts
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Akiba API')
    .setDescription('Akiba wealth management platform API — BCEAO PI-SPI integrated')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & registration')
    .addTag('users', 'User profile & KYC')
    .addTag('payments', 'PI-SPI deposits & withdrawals')
    .addTag('portfolios', 'Portfolio management & robo-advisor')
    .addTag('investments', 'Trade execution & holdings')
    .addTag('savings', 'Goal-based savings')
    .addTag('markets', 'Asset catalog & market data')
    .addTag('education', 'Financial literacy & gamification')
    .addTag('notifications', 'Push, SMS, in-app notifications')
    .addTag('compliance', 'AML/CFT & audit')
    .addTag('admin', 'Back-office administration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Akiba API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
