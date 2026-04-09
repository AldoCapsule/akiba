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

export enum DepositProvider {
  ORANGE_MONEY = 'ORANGE_MONEY',
  WAVE = 'WAVE',
  FREE_MONEY = 'FREE_MONEY',
  MTN_MOMO = 'MTN_MOMO',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreateDepositDto {
  @ApiProperty({
    description: 'Deposit amount in CFA francs',
    example: 25000,
    minimum: 500,
  })
  @IsNumber()
  @IsPositive()
  @Min(500, { message: 'Minimum deposit is 500 CFA' })
  amount: number;

  @ApiProperty({
    description: 'Payment provider (PI-SPI compliant)',
    enum: DepositProvider,
    example: DepositProvider.ORANGE_MONEY,
  })
  @IsEnum(DepositProvider)
  provider: DepositProvider;

  @ApiProperty({
    description: 'Source mobile money number or account reference',
    example: '+22170001234',
  })
  @IsString()
  @IsNotEmpty()
  sourceAccount: string;

  @ApiProperty({
    description: 'Optional reference note',
    example: 'Monthly savings deposit',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
