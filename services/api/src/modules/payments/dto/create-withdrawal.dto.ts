import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export enum WithdrawalProvider {
  ORANGE_MONEY = 'ORANGE_MONEY',
  WAVE = 'WAVE',
  FREE_MONEY = 'FREE_MONEY',
  MTN_MOMO = 'MTN_MOMO',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreateWithdrawalDto {
  @ApiProperty({
    description: 'Withdrawal amount in CFA francs',
    example: 10000,
    minimum: 1000,
  })
  @IsNumber()
  @IsPositive()
  @Min(1000, { message: 'Minimum withdrawal is 1000 CFA' })
  amount: number;

  @ApiProperty({
    description: 'Destination payment provider',
    enum: WithdrawalProvider,
    example: WithdrawalProvider.ORANGE_MONEY,
  })
  @IsEnum(WithdrawalProvider)
  provider: WithdrawalProvider;

  @ApiProperty({
    description: 'Destination mobile money number or bank account',
    example: '+22170001234',
  })
  @IsString()
  @IsNotEmpty()
  destinationAccount: string;

  @ApiProperty({
    description: '4-digit PIN for transaction authorization',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({
    description: 'Optional reference note',
    example: 'Emergency withdrawal',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
