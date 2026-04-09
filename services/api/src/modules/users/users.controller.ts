import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { RiskAssessmentDto } from './dto/risk-assessment.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile including KYC status and risk profile.',
  })
  @ApiOkResponse({ description: 'User profile returned' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user?.id);
  }

  @Put('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates profile fields for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Profile updated' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user?.id, dto);
  }

  @Post('me/kyc')
  @ApiOperation({
    summary: 'Submit KYC documents',
    description:
      'Submits identity documents for KYC verification. Review is typically completed within 24 hours.',
  })
  @ApiCreatedResponse({ description: 'KYC submission received' })
  @ApiBadRequestResponse({ description: 'Invalid documents or data' })
  async submitKyc(@Request() req: any, @Body() dto: SubmitKycDto) {
    return this.usersService.submitKyc(req.user?.id, dto);
  }

  @Get('me/kyc')
  @ApiOperation({
    summary: 'Get KYC status',
    description: 'Returns the current KYC verification status and details for the authenticated user.',
  })
  @ApiOkResponse({ description: 'KYC status returned' })
  async getKycStatus(@Request() req: any) {
    return this.usersService.getKycStatus(req.user?.id);
  }

  @Post('me/risk-assessment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit risk assessment questionnaire',
    description:
      'Submits the risk assessment questionnaire to determine the investor risk profile used by the robo-advisor.',
  })
  @ApiOkResponse({ description: 'Risk profile computed and saved' })
  @ApiBadRequestResponse({ description: 'Invalid assessment data' })
  async submitRiskAssessment(@Request() req: any, @Body() dto: RiskAssessmentDto) {
    return this.usersService.submitRiskAssessment(req.user?.id, dto);
  }

  @Get('me/risk-assessment')
  @ApiOperation({
    summary: 'Get current risk profile',
    description: 'Returns the computed risk profile for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Risk profile returned' })
  async getRiskProfile(@Request() req: any) {
    return this.usersService.getRiskProfile(req.user?.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID (admin)',
    description: 'Returns a specific user profile by ID. Requires admin role.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ description: 'User profile returned' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}
