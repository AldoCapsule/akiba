import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KycTierGuard, RequireKycTier } from '../auth/kyc-tier.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { RiskAssessmentDto } from './dto/risk-assessment.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, KycTierGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile with wallets' })
  @ApiOkResponse({ description: 'User profile returned' })
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile (name, email, language, halal preference)' })
  @ApiOkResponse({ description: 'Profile updated' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('me/kyc')
  @ApiOperation({ summary: 'Submit KYC documents for verification' })
  @ApiCreatedResponse({ description: 'KYC submission received' })
  async submitKyc(@Request() req: any, @Body() dto: SubmitKycDto) {
    return this.usersService.submitKyc(req.user.id, dto);
  }

  @Get('me/kyc')
  @ApiOperation({ summary: 'Get KYC verification status and documents' })
  @ApiOkResponse({ description: 'KYC status returned' })
  async getKycStatus(@Request() req: any) {
    return this.usersService.getKycStatus(req.user.id);
  }

  @Post('me/risk-assessment')
  @HttpCode(HttpStatus.OK)
  @RequireKycTier('tier_1')
  @ApiOperation({ summary: 'Submit risk assessment questionnaire' })
  @ApiOkResponse({ description: 'Risk profile computed and saved' })
  async submitRiskAssessment(@Request() req: any, @Body() dto: RiskAssessmentDto) {
    return this.usersService.submitRiskAssessment(req.user.id, dto);
  }

  @Get('me/risk-assessment')
  @ApiOperation({ summary: 'Get current risk profile' })
  @ApiOkResponse({ description: 'Risk profile returned' })
  async getRiskProfile(@Request() req: any) {
    return this.usersService.getRiskProfile(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<any> {
    return this.usersService.getUserById(id);
  }
}
