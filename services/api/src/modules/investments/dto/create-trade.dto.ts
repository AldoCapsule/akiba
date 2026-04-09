import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export class CreateTradeDto {
  @ApiProperty({
    description: 'Portfolio ID to execute the trade in',
    example: 'portfolio_uuid_here',
  })
  @IsString()
  @IsNotEmpty()
  portfolioId: string;

  @ApiProperty({
    description: 'Asset symbol or ID (e.g. BRVM ticker)',
    example: 'SNTS',
  })
  @IsString()
  @IsNotEmpty()
  assetSymbol: string;

  @ApiProperty({
    description: 'Trade direction',
    enum: TradeType,
    example: TradeType.BUY,
  })
  @IsEnum(TradeType)
  type: TradeType;

  @ApiProperty({
    description: 'Order type',
    enum: OrderType,
    example: OrderType.MARKET,
  })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({
    description: 'Number of units/shares to trade',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Limit price per unit in CFA (required for LIMIT orders)',
    example: 15000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limitPrice?: number;

  @ApiProperty({
    description: '4-digit PIN for trade authorization',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({
    description: 'Optional note for the trade',
    example: 'Buying Sonatel dip',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
