import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SetPinDto } from './dto/set-pin.dto';

const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 3;
const OTP_RATE_LIMIT_MINUTES = 15;
const OTP_RATE_LIMIT_COUNT = 3;
const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_DAYS = 30;
const MAX_DEVICES = 2;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Registration ─────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.db.user.findUnique({
      where: { phoneNumber: dto.phone },
    });

    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    // Rate-limit OTP requests
    await this.enforceOtpRateLimit(dto.phone);

    // Generate referral code
    const referralCode = this.generateReferralCode();

    // Create user
    const user = await this.db.user.create({
      data: {
        phoneNumber: dto.phone,
        fullName: dto.fullName,
        email: dto.email || null,
        preferredLanguage: (dto.language as any) || 'fr',
        referralCode,
        referredById: dto.referralCode
          ? (await this.resolveReferrer(dto.referralCode))
          : null,
      },
    });

    // Generate and store OTP
    const otp = await this.createOtp(dto.phone, 'registration');

    // TODO: Send OTP via SMS gateway (Africa's Talking / Twilio)
    // await this.smsService.send(dto.phone, `Akiba: Votre code de vérification est ${otp}`);
    this.logger.log(`[DEV] OTP for ${dto.phone}: ${otp}`);

    return {
      success: true,
      data: {
        message: 'OTP sent to your phone number',
        userId: user.id,
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      },
    };
  }

  // ─── OTP Verification ─────────────────────────────────────────────

  async verifyOtp(dto: VerifyOtpDto) {
    const otpRecord = await this.db.otpCode.findFirst({
      where: {
        phone: dto.phone,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('No valid OTP found. Please request a new one.');
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      // Mark as used to prevent further attempts
      await this.db.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new ForbiddenException('Too many failed attempts. Please request a new OTP.');
    }

    if (otpRecord.code !== dto.code) {
      await this.db.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Mark OTP as used
    await this.db.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Find user and update KYC status if first verification
    const user = await this.db.user.findUnique({
      where: { phoneNumber: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // If this is a registration verification, mark as tier_0 verified
    if (otpRecord.purpose === 'registration') {
      await this.db.user.update({
        where: { id: user.id },
        data: { kycStatus: 'pending' }, // Phone verified, KYC still pending
      });

      // Create default wallets for the user
      await this.createDefaultWallets(user.id);
    }

    // Generate token pair
    const tokens = await this.generateTokenPair(user.id);

    // Log audit event
    await this.logAudit(user.id, 'otp_verified', 'user', user.id);

    return {
      success: true,
      data: {
        ...tokens,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          kycStatus: user.kycStatus,
          kycTier: user.kycTier,
          isHalalOnly: user.isHalalOnly,
          preferredLanguage: user.preferredLanguage,
        },
      },
    };
  }

  // ─── Login with PIN ───────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.db.user.findUnique({
      where: { phoneNumber: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.pinHash) {
      throw new BadRequestException('PIN not set. Please set your PIN first.');
    }

    const pinValid = await bcrypt.compare(dto.pin, user.pinHash);
    if (!pinValid) {
      await this.logAudit(user.id, 'login_failed', 'user', user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokenPair(user.id);

    await this.logAudit(user.id, 'login_success', 'user', user.id);

    return {
      success: true,
      data: {
        ...tokens,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          kycStatus: user.kycStatus,
          kycTier: user.kycTier,
          riskProfile: user.riskProfile,
          isHalalOnly: user.isHalalOnly,
          preferredLanguage: user.preferredLanguage,
        },
      },
    };
  }

  // ─── Token Refresh (with rotation) ────────────────────────────────

  async refreshToken(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const stored = await this.db.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      // If token was already used (revoked), revoke ALL tokens for this user
      // This detects token theft — attacker uses a stolen refresh token
      if (stored?.isRevoked) {
        await this.db.refreshToken.updateMany({
          where: { userId: stored.userId },
          data: { isRevoked: true },
        });
        this.logger.warn(`Potential token theft detected for user ${stored.userId}`);
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke the old refresh token (rotation)
    await this.db.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    // Issue new pair
    const tokens = await this.generateTokenPair(stored.userId);

    return { success: true, data: tokens };
  }

  // ─── Set PIN ──────────────────────────────────────────────────────

  async setPin(userId: string, dto: SetPinDto) {
    if (dto.pin !== dto.pinConfirmation) {
      throw new BadRequestException('PIN and confirmation do not match');
    }

    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const pinHash = await bcrypt.hash(dto.pin, BCRYPT_ROUNDS);

    await this.db.user.update({
      where: { id: userId },
      data: { pinHash },
    });

    await this.logAudit(userId, 'pin_set', 'user', userId);

    return { success: true, data: { message: 'PIN set successfully' } };
  }

  // ─── Request OTP (for login or re-verification) ───────────────────

  async requestOtp(phone: string) {
    const user = await this.db.user.findUnique({
      where: { phoneNumber: phone },
    });

    if (!user) {
      throw new BadRequestException('Phone number not registered');
    }

    await this.enforceOtpRateLimit(phone);

    const otp = await this.createOtp(phone, 'login');

    // TODO: Send via SMS
    this.logger.log(`[DEV] OTP for ${phone}: ${otp}`);

    return {
      success: true,
      data: {
        message: 'OTP sent to your phone number',
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      },
    };
  }

  // ─── Device Binding ───────────────────────────────────────────────

  async registerDevice(userId: string, deviceId: string, deviceName: string, platform: string) {
    const existingDevices = await this.db.userDevice.count({
      where: { userId, isActive: true },
    });

    const alreadyRegistered = await this.db.userDevice.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });

    if (alreadyRegistered) {
      await this.db.userDevice.update({
        where: { id: alreadyRegistered.id },
        data: { lastLoginAt: new Date(), isActive: true },
      });
      return;
    }

    if (existingDevices >= MAX_DEVICES) {
      throw new ForbiddenException(
        `Maximum ${MAX_DEVICES} devices allowed. Please remove a device first.`,
      );
    }

    await this.db.userDevice.create({
      data: { userId, deviceId, deviceName, platform },
    });
  }

  // ─── Private Helpers ──────────────────────────────────────────────

  private async createOtp(phone: string, purpose: string): Promise<string> {
    // Invalidate previous unused OTPs for this phone/purpose
    await this.db.otpCode.updateMany({
      where: { phone, purpose, isUsed: false },
      data: { isUsed: true },
    });

    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.db.otpCode.create({
      data: { phone, code, purpose, expiresAt },
    });

    return code;
  }

  private generateOtpCode(): string {
    // Cryptographically secure 6-digit code
    return crypto.randomInt(100000, 999999).toString();
  }

  private generateReferralCode(): string {
    return 'AK' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private async resolveReferrer(referralCode: string): Promise<string | null> {
    const referrer = await this.db.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    return referrer?.id ?? null;
  }

  private async enforceOtpRateLimit(phone: string) {
    const recentOtps = await this.db.otpCode.count({
      where: {
        phone,
        createdAt: {
          gt: new Date(Date.now() - OTP_RATE_LIMIT_MINUTES * 60 * 1000),
        },
      },
    });

    if (recentOtps >= OTP_RATE_LIMIT_COUNT) {
      throw new BadRequestException(
        `Too many OTP requests. Please wait ${OTP_RATE_LIMIT_MINUTES} minutes.`,
      );
    }
  }

  private async generateTokenPair(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRY', '15m'),
    });

    // Generate opaque refresh token, store hash
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    await this.db.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async createDefaultWallets(userId: string) {
    const walletTypes = ['cash', 'investment', 'savings'] as const;
    for (const walletType of walletTypes) {
      await this.db.wallet.create({
        data: { userId, walletType },
      });
    }
  }

  private async logAudit(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
  ) {
    await this.db.auditLog.create({
      data: { userId, action, entityType, entityId },
    });
  }
}
