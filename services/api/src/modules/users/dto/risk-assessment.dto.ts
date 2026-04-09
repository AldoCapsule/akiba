import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export enum InvestmentHorizon {
  SHORT_TERM = 'SHORT_TERM',
  MEDIUM_TERM = 'MEDIUM_TERM',
  LONG_TERM = 'LONG_TERM',
}

export enum IncomeRange {
  BELOW_100K = 'BELOW_100K',
  FROM_100K_TO_300K = 'FROM_100K_TO_300K',
  FROM_300K_TO_1M = 'FROM_300K_TO_1M',
  ABOVE_1M = 'ABOVE_1M',
}

export enum InvestmentExperience {
  NONE = 'NONE',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export class RiskAssessmentDto {
  @ApiProperty({
    description: 'Monthly income range in CFA francs',
    enum: IncomeRange,
    example: IncomeRange.FROM_100K_TO_300K,
  })
  @IsEnum(IncomeRange)
  @IsNotEmpty()
  incomeRange!: IncomeRange;

  @ApiProperty({
    description: 'Investment time horizon',
    enum: InvestmentHorizon,
    example: InvestmentHorizon.MEDIUM_TERM,
  })
  @IsEnum(InvestmentHorizon)
  @IsNotEmpty()
  investmentHorizon!: InvestmentHorizon;

  @ApiProperty({
    description: 'Prior investment experience level',
    enum: InvestmentExperience,
    example: InvestmentExperience.BEGINNER,
  })
  @IsEnum(InvestmentExperience)
  @IsNotEmpty()
  investmentExperience!: InvestmentExperience;

  @ApiProperty({
    description: 'Risk tolerance score (1 = very conservative, 10 = very aggressive)',
    example: 5,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  riskTolerance!: number;

  @ApiProperty({
    description: 'Acceptable maximum loss percentage (1-50)',
    example: 15,
    minimum: 1,
    maximum: 50,
  })
  @IsInt()
  @Min(1)
  @Max(50)
  maxAcceptableLoss!: number;
}
