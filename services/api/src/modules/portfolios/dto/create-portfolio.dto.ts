import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsPositive,
  MaxLength,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PortfolioStrategy {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE_CONSERVATIVE = 'MODERATE_CONSERVATIVE',
  MODERATE = 'MODERATE',
  MODERATE_AGGRESSIVE = 'MODERATE_AGGRESSIVE',
  AGGRESSIVE = 'AGGRESSIVE',
  CUSTOM = 'CUSTOM',
}

export class AllocationItemDto {
  @ApiProperty({ description: 'Asset class identifier', example: 'BRVM_EQUITY' })
  @IsString()
  @IsNotEmpty()
  assetClass: string;

  @ApiProperty({
    description: 'Target allocation percentage (0-100)',
    example: 40,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  targetPercent: number;
}

export class CreatePortfolioDto {
  @ApiProperty({
    description: 'Portfolio display name',
    example: 'My Growth Portfolio',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Portfolio strategy (uses robo-advisor for non-CUSTOM)',
    enum: PortfolioStrategy,
    example: PortfolioStrategy.MODERATE,
  })
  @IsEnum(PortfolioStrategy)
  strategy: PortfolioStrategy;

  @ApiProperty({
    description: 'Initial investment amount in CFA francs',
    example: 50000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  initialAmount?: number;

  @ApiProperty({
    description: 'Custom allocation (required for CUSTOM strategy)',
    type: [AllocationItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllocationItemDto)
  customAllocation?: AllocationItemDto[];

  @ApiProperty({
    description: 'Description or goal for this portfolio',
    example: 'Long-term wealth building for retirement',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
