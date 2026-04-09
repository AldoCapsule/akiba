import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Phone number in E.164 format (Senegal: +221)',
    example: '+221770001234',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, { message: 'Phone must be E.164 format, e.g. +221770001234' })
  phone!: string;

  @ApiProperty({ description: 'Full legal name', example: 'Aminata Diallo' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'aminata@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Preferred language', example: 'fr', default: 'fr' })
  @IsOptional()
  @IsString()
  @Matches(/^(fr|wo|en)$/, { message: 'Language must be fr, wo, or en' })
  language?: string;

  @ApiPropertyOptional({ description: 'Referral code from another user', example: 'AK1A2B3C4D' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
