import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SetPinDto } from './dto/set-pin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with phone number and sends an OTP via SMS for verification.',
  })
  @ApiCreatedResponse({ description: 'OTP sent to the provided phone number' })
  @ApiConflictResponse({ description: 'Phone number already registered' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP code',
    description:
      'Verifies the OTP sent during registration or login. Returns access and refresh tokens on success.',
  })
  @ApiOkResponse({ description: 'OTP verified, tokens returned' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with phone and PIN',
    description:
      'Authenticates a user with their phone number and 4-digit PIN. Returns access and refresh tokens.',
  })
  @ApiOkResponse({ description: 'Login successful, tokens returned' })
  @ApiUnauthorizedResponse({ description: 'Invalid phone or PIN' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Exchanges a valid refresh token for a new access token and refresh token pair.',
  })
  @ApiOkResponse({ description: 'New token pair returned' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('set-pin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Set or update PIN',
    description:
      'Sets a 4-digit PIN for the authenticated user. Used for transaction authorization and login.',
  })
  @ApiOkResponse({ description: 'PIN set successfully' })
  @ApiBadRequestResponse({ description: 'PIN and confirmation do not match' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async setPin(@Request() req: any, @Body() dto: SetPinDto) {
    return this.authService.setPin(req.user?.id, dto);
  }

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a new OTP',
    description: 'Sends a fresh OTP to the given phone number for login or verification.',
  })
  @ApiOkResponse({ description: 'OTP sent' })
  @ApiBadRequestResponse({ description: 'Phone number not found' })
  async requestOtp(@Body('phone') phone: string) {
    return this.authService.requestOtp(phone);
  }
}
