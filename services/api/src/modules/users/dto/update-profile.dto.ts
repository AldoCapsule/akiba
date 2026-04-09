import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Full legal name', example: 'Aminata Diallo' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'aminata@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Date of birth (ISO 8601)', example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Preferred language: fr, wo, en', example: 'fr' })
  @IsOptional()
  @IsString()
  @Matches(/^(fr|wo|en)$/, { message: 'Language must be fr, wo, or en' })
  preferredLanguage?: string;

  @ApiPropertyOptional({ description: 'Show only Halal-compliant investments', example: false })
  @IsOptional()
  @IsBoolean()
  isHalalOnly?: boolean;
}
