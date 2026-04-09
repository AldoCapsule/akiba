import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsNotEmpty, IsOptional, MaxLength, Min } from 'class-validator';

export class ContributeGoalDto {
  @ApiProperty({
    description: 'Contribution amount in CFA francs',
    example: 10000,
    minimum: 500,
  })
  @IsNumber()
  @IsPositive()
  @Min(500, { message: 'Minimum contribution is 500 CFA' })
  amount: number;

  @ApiProperty({
    description: '4-digit PIN for authorization',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({
    description: 'Optional note',
    example: 'Weekly savings',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
