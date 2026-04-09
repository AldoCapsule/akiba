import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum WebhookEventType {
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  REFUND_SUCCESS = 'REFUND_SUCCESS',
  REFUND_FAILED = 'REFUND_FAILED',
}

export class PispiWebhookDto {
  @ApiProperty({
    description: 'Unique transaction ID from PI-SPI provider',
    example: 'txn_abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'Internal reference ID (mapped during initiation)',
    example: 'dep_xyz789',
  })
  @IsString()
  @IsNotEmpty()
  referenceId: string;

  @ApiProperty({
    description: 'Webhook event type',
    enum: WebhookEventType,
    example: WebhookEventType.PAYMENT_SUCCESS,
  })
  @IsEnum(WebhookEventType)
  eventType: WebhookEventType;

  @ApiProperty({
    description: 'Transaction amount in CFA francs',
    example: 25000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'XOF',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Provider-specific status code',
    example: '00',
    required: false,
  })
  @IsOptional()
  @IsString()
  statusCode?: string;

  @ApiProperty({
    description: 'Provider-specific status message',
    example: 'Transaction completed successfully',
    required: false,
  })
  @IsOptional()
  @IsString()
  statusMessage?: string;

  @ApiProperty({
    description: 'HMAC signature for webhook verification',
    example: 'sha256=abc123...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
