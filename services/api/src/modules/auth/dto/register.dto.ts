import { ApiProperty } from '@nestjs/swagger';
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
    description: 'Phone number in E.164 format (WAEMU region)',
    example: '+22170001234',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, {
    message: 'Phone number must be in E.164 format, e.g. +22170001234',
  })
  phone: string;

  @ApiProperty({
    description: 'Full legal name',
    example: 'Aminata Diallo',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Email address (optional)',
    example: 'aminata@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Preferred language code',
    example: 'fr',
    default: 'fr',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(fr|en|wo|bm)$/, {
    message: 'Language must be one of: fr, en, wo, bm',
  })
  language?: string;
}
