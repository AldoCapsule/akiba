import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Phone number in E.164 format',
    example: '+221770001234',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, { message: 'Phone must be E.164 format, e.g. +221770001234' })
  phone!: string;

  @ApiProperty({
    description: '6-digit PIN',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'PIN must be exactly 6 digits' })
  pin!: string;
}
