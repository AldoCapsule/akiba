import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class SetPinDto {
  @ApiProperty({
    description: 'New 4-digit PIN',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  pin: string;

  @ApiProperty({
    description: 'Confirm the 4-digit PIN',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'PIN confirmation must be exactly 4 digits' })
  pinConfirmation: string;
}
