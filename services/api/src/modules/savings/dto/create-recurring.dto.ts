import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export class CreateRecurringDto {
  @ApiProperty({
    description: 'Savings goal ID to contribute to',
    example: 'goal_uuid_here',
  })
  @IsString()
  @IsNotEmpty()
  goalId!: string;

  @ApiProperty({
    description: 'Recurring deposit amount in CFA francs',
    example: 5000,
    minimum: 500,
  })
  @IsNumber()
  @IsPositive()
  @Min(500, { message: 'Minimum recurring amount is 500 CFA' })
  amount!: number;

  @ApiProperty({
    description: 'Frequency of the recurring deposit',
    enum: RecurringFrequency,
    example: RecurringFrequency.WEEKLY,
  })
  @IsEnum(RecurringFrequency)
  frequency!: RecurringFrequency;

  @ApiProperty({
    description: 'Source mobile money account for auto-debit',
    example: '+22170001234',
  })
  @IsString()
  @IsNotEmpty()
  sourceAccount!: string;

  @ApiProperty({
    description: 'Start date for recurring deposits',
    example: '2026-05-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'End date for recurring deposits (optional, defaults to goal target date)',
    example: '2027-06-30',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
