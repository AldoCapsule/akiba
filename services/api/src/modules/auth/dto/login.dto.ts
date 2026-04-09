import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Registered phone number in E.164 format',
    example: '+22170001234',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phone: string;

  @ApiProperty({
    description: '4-digit PIN',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  pin: string;
}
