import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Full legal name',
    example: 'Aminata Diallo',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'aminata@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Date of birth in ISO 8601 format',
    example: '1995-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Residential address',
    example: 'Rue 10, Mermoz, Dakar',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @ApiProperty({
    description: 'City of residence',
    example: 'Dakar',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'SN',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be a 2-letter ISO code' })
  country?: string;

  @ApiProperty({
    description: 'Preferred language',
    example: 'fr',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(fr|en|wo|bm)$/, {
    message: 'Language must be one of: fr, en, wo, bm',
  })
  language?: string;
}
