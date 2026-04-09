import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDateString,
  MaxLength,
  IsEnum,
} from 'class-validator';

export enum GoalCategory {
  EMERGENCY_FUND = 'EMERGENCY_FUND',
  EDUCATION = 'EDUCATION',
  HOUSING = 'HOUSING',
  BUSINESS = 'BUSINESS',
  RETIREMENT = 'RETIREMENT',
  TRAVEL = 'TRAVEL',
  WEDDING = 'WEDDING',
  CUSTOM = 'CUSTOM',
}

export class CreateGoalDto {
  @ApiProperty({
    description: 'Goal name',
    example: 'Emergency Fund',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Goal category',
    enum: GoalCategory,
    example: GoalCategory.EMERGENCY_FUND,
  })
  @IsEnum(GoalCategory)
  category!: GoalCategory;

  @ApiProperty({
    description: 'Target amount in CFA francs',
    example: 500000,
  })
  @IsNumber()
  @IsPositive()
  targetAmount!: number;

  @ApiProperty({
    description: 'Target date to reach the goal',
    example: '2027-06-30',
  })
  @IsDateString()
  targetDate!: string;

  @ApiProperty({
    description: 'Optional description',
    example: '6 months of living expenses',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Initial contribution in CFA francs',
    example: 25000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  initialContribution?: number;
}
