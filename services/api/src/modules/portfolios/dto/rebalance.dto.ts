import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsArray, ValidateNested, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RebalanceAllocationDto {
  @ApiProperty({ description: 'Asset class identifier', example: 'BRVM_EQUITY' })
  @IsString()
  assetClass!: string;

  @ApiProperty({ description: 'New target allocation percentage', example: 45 })
  @IsNumber()
  @Min(0)
  @Max(100)
  targetPercent!: number;
}

export class RebalanceDto {
  @ApiProperty({
    description: 'If true, the robo-advisor will compute the optimal rebalancing automatically',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoRebalance?: boolean;

  @ApiProperty({
    description: 'Custom target allocations (only used if autoRebalance is false)',
    type: [RebalanceAllocationDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RebalanceAllocationDto)
  targetAllocations?: RebalanceAllocationDto[];
}
