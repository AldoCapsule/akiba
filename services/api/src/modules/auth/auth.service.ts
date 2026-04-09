import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SetPinDto } from './dto/set-pin.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly db: DatabaseService) {}

  async register(dto: RegisterDto) {
    // TODO: Check if phone already exists in database
    // TODO: Generate 6-digit OTP
    // TODO: Store OTP with expiry (5 minutes) in cache or DB
    // TODO: Send OTP via SMS provider (Orange Money SMS, Twilio, etc.)
    // TODO: Create user record with status=PENDING_VERIFICATION

    const existing = await this.db.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    const user = await this.db.user.create({
      data: {
        phone: dto.phone,
        fullName: dto.fullName,
        email: dto.email,
        language: dto.language || 'fr',
        status: 'PENDING_VERIFICATION',
      },
    });

    // TODO: Send OTP via SMS gateway
    this.logger.log(`OTP sent to ${dto.phone} for registration`);

    return {
      message: 'OTP sent to your phone number',
      userId: user.id,
      expiresIn: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    // TODO: Look up stored OTP for this phone number
    // TODO: Validate OTP matches and is not expired
    // TODO: Mark user as ACTIVE
    // TODO: Generate JWT access token + refresh token
    // TODO: Invalidate the used OTP

    const user = await this.db.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid phone number');
    }

    // TODO: Replace with actual OTP validation
    this.logger.log(`OTP verified for ${dto.phone}`);

    return {
      accessToken: 'TODO_GENERATE_JWT_ACCESS_TOKEN',
      refreshToken: 'TODO_GENERATE_JWT_REFRESH_TOKEN',
      expiresIn: 3600,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        status: user.status,
      },
    };
  }

  async login(dto: LoginDto) {
    // TODO: Find user by phone
    // TODO: Verify PIN hash matches
    // TODO: Check user is ACTIVE
    // TODO: Generate JWT token pair
    // TODO: Record login event for audit

    const user = await this.db.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: Compare hashed PIN
    // if (!await bcrypt.compare(dto.pin, user.pinHash)) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }

    this.logger.log(`User ${user.id} logged in`);

    return {
      accessToken: 'TODO_GENERATE_JWT_ACCESS_TOKEN',
      refreshToken: 'TODO_GENERATE_JWT_REFRESH_TOKEN',
      expiresIn: 3600,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    // TODO: Validate the refresh token (check signature, expiry, revocation)
    // TODO: Extract user ID from the token payload
    // TODO: Issue new access + refresh token pair
    // TODO: Revoke the old refresh token (rotation)

    this.logger.log('Token refresh requested');

    return {
      accessToken: 'TODO_NEW_JWT_ACCESS_TOKEN',
      refreshToken: 'TODO_NEW_JWT_REFRESH_TOKEN',
      expiresIn: 3600,
    };
  }

  async setPin(userId: string, dto: SetPinDto) {
    if (dto.pin !== dto.pinConfirmation) {
      throw new BadRequestException('PIN and confirmation do not match');
    }

    // TODO: Hash the PIN with bcrypt
    // TODO: Store hashed PIN on user record
    // TODO: If PIN already set, require current PIN for change

    await this.db.user.update({
      where: { id: userId },
      data: {
        // pinHash: await bcrypt.hash(dto.pin, 12),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`PIN set for user ${userId}`);

    return { message: 'PIN set successfully' };
  }

  async requestOtp(phone: string) {
    // TODO: Verify user with this phone exists
    // TODO: Generate and store 6-digit OTP
    // TODO: Send via SMS provider
    // TODO: Rate-limit OTP requests (max 3 per 15 minutes)

    const user = await this.db.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new BadRequestException('Phone number not found');
    }

    this.logger.log(`OTP requested for ${phone}`);

    return {
      message: 'OTP sent to your phone number',
      expiresIn: 300,
    };
  }
}
