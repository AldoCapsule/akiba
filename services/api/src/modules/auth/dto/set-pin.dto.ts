import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class SetPinDto {
  @ApiProperty({ description: '6-digit PIN', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'PIN must be exactly 6 digits' })
  pin!: string;

  @ApiProperty({ description: 'Confirm the 6-digit PIN', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'PIN confirmation must be exactly 6 digits' })
  pinConfirmation!: string;
}
