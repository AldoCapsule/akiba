import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class SubmitKycDto {
  @ApiProperty({
    description: 'S3 key for front of ID document',
    example: 'kyc/user-123/national_id_front.jpg',
  })
  @IsString()
  @IsNotEmpty()
  documentFrontKey!: string;

  @ApiPropertyOptional({
    description: 'S3 key for back of ID document',
    example: 'kyc/user-123/national_id_back.jpg',
  })
  @IsOptional()
  @IsString()
  documentBackKey?: string;

  @ApiProperty({
    description: 'S3 key for selfie photo',
    example: 'kyc/user-123/selfie.jpg',
  })
  @IsString()
  @IsNotEmpty()
  selfieKey!: string;

  @ApiPropertyOptional({
    description: 'National ID number',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationalIdNumber?: string;
}
