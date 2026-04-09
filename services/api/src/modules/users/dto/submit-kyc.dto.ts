import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export enum DocumentType {
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  RESIDENCE_PERMIT = 'RESIDENCE_PERMIT',
}

export class SubmitKycDto {
  @ApiProperty({
    description: 'Type of identity document',
    enum: DocumentType,
    example: DocumentType.NATIONAL_ID,
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    description: 'Document number',
    example: 'SN-1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  documentNumber: string;

  @ApiProperty({
    description: 'Document expiry date',
    example: '2028-12-31',
  })
  @IsDateString()
  documentExpiry: string;

  @ApiProperty({
    description: 'URL of the front image of the document (uploaded via file service)',
    example: 'https://storage.akiba.app/kyc/front-abc123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  documentFrontUrl: string;

  @ApiProperty({
    description: 'URL of the back image of the document',
    example: 'https://storage.akiba.app/kyc/back-abc123.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  documentBackUrl?: string;

  @ApiProperty({
    description: 'URL of selfie photo for liveness check',
    example: 'https://storage.akiba.app/kyc/selfie-abc123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  selfieUrl: string;

  @ApiProperty({
    description: 'Full legal name as it appears on the document',
    example: 'Aminata Diallo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  legalName: string;

  @ApiProperty({
    description: 'Date of birth as it appears on the document',
    example: '1995-06-15',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Nationality (ISO 3166-1 alpha-2)',
    example: 'SN',
  })
  @IsString()
  @IsNotEmpty()
  nationality: string;
}
