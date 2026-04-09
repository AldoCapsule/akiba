import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { RiskAssessmentDto } from './dto/risk-assessment.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly db: DatabaseService) {}

  async getProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        nationalIdNumber: true,
        kycStatus: true,
        kycTier: true,
        riskProfile: true,
        isHalalOnly: true,
        preferredLanguage: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
        wallets: {
          select: {
            id: true,
            walletType: true,
            balanceFcfa: true,
            currency: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return { success: true, data: user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // If KYC is verified, prevent changing name/DOB
    if (user.kycStatus === 'verified' && (dto.fullName || dto.dateOfBirth)) {
      throw new BadRequestException(
        'Cannot change name or date of birth after KYC verification. Contact support.',
      );
    }

    const updated = await this.db.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.email && { email: dto.email }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.preferredLanguage && { preferredLanguage: dto.preferredLanguage as any }),
        ...(dto.isHalalOnly !== undefined && { isHalalOnly: dto.isHalalOnly }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        preferredLanguage: true,
        isHalalOnly: true,
        updatedAt: true,
      },
    });

    return { success: true, data: updated };
  }

  // ─── KYC ──────────────────────────────────────────────────────────

  async submitKyc(userId: string, dto: SubmitKycDto) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.kycStatus === 'verified') {
      throw new BadRequestException('KYC already verified');
    }

    // Create KYC document records
    const docs = [];
    docs.push({ userId, documentType: 'national_id_front', s3Key: dto.documentFrontKey });
    if (dto.documentBackKey) {
      docs.push({ userId, documentType: 'national_id_back', s3Key: dto.documentBackKey });
    }
    docs.push({ userId, documentType: 'selfie', s3Key: dto.selfieKey });

    await this.db.kycDocument.createMany({ data: docs });

    // Update user
    await this.db.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'submitted',
        ...(dto.nationalIdNumber && { nationalIdNumber: dto.nationalIdNumber }),
      },
    });

    // TODO: Trigger Smile ID verification via background job
    // await this.smileIdService.verifyIdentity(userId, docs);

    await this.db.auditLog.create({
      data: { userId, action: 'kyc_submitted', entityType: 'user', entityId: userId },
    });

    this.logger.log(`KYC submitted for user ${userId}`);

    return {
      success: true,
      data: {
        message: 'KYC documents submitted for review',
        status: 'submitted',
        estimatedReviewTime: '24 hours',
      },
    };
  }

  async getKycStatus(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true, kycTier: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const documents = await this.db.kycDocument.findMany({
      where: { userId },
      select: {
        id: true,
        documentType: true,
        status: true,
        reviewNotes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: {
        kycStatus: user.kycStatus,
        kycTier: user.kycTier,
        documents,
      },
    };
  }

  // ─── Risk Assessment ──────────────────────────────────────────────

  async submitRiskAssessment(userId: string, dto: RiskAssessmentDto) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const score = this.calculateRiskScore(dto);
    const profile = this.mapScoreToProfile(score);

    // Store assessment as audit log with full answers
    await this.db.auditLog.create({
      data: {
        userId,
        action: 'risk_assessment_completed',
        entityType: 'user',
        entityId: userId,
        details: {
          answers: { ...dto },
          computedScore: score,
          riskProfile: profile,
        },
      },
    });

    await this.db.user.update({
      where: { id: userId },
      data: { riskProfile: profile as any },
    });

    this.logger.log(`Risk assessment: user ${userId} → ${profile} (score: ${score})`);

    return {
      success: true,
      data: {
        score,
        riskProfile: profile,
        description: this.getProfileDescription(profile),
      },
    };
  }

  async getRiskProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { riskProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');

    if (!user.riskProfile) {
      return {
        success: true,
        data: {
          hasAssessment: false,
          message: 'Please complete the risk assessment questionnaire.',
        },
      };
    }

    return {
      success: true,
      data: {
        hasAssessment: true,
        riskProfile: user.riskProfile,
        description: this.getProfileDescription(user.riskProfile),
      },
    };
  }

  // ─── Admin helpers ────────────────────────────────────────────────

  async getUserById(id: string): Promise<any> {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        wallets: true,
        kycDocuments: true,
        portfolios: { where: { isActive: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { success: true, data: user };
  }

  // ─── Risk Scoring Algorithm ───────────────────────────────────────

  private calculateRiskScore(dto: RiskAssessmentDto): number {
    let score = 0;

    // Q1: Income range (0-20 points)
    const incomeScores: Record<string, number> = {
      BELOW_100K: 5,
      FROM_100K_TO_300K: 10,
      FROM_300K_TO_1M: 15,
      ABOVE_1M: 20,
    };
    score += incomeScores[dto.incomeRange] || 0;

    // Q2: Investment horizon (0-25 points) — longest horizon = most aggressive
    const horizonScores: Record<string, number> = {
      SHORT_TERM: 5,
      MEDIUM_TERM: 15,
      LONG_TERM: 25,
    };
    score += horizonScores[dto.investmentHorizon] || 0;

    // Q3: Experience (0-20 points)
    const experienceScores: Record<string, number> = {
      NONE: 3,
      BEGINNER: 8,
      INTERMEDIATE: 15,
      ADVANCED: 20,
    };
    score += experienceScores[dto.investmentExperience] || 0;

    // Q4: Risk tolerance 1-10 → 0-20 points
    score += dto.riskTolerance * 2;

    // Q5: Max acceptable loss 1-50 → 0-15 points
    score += Math.min(dto.maxAcceptableLoss * 0.3, 15);

    return Math.round(Math.min(score, 100));
  }

  private mapScoreToProfile(score: number): string {
    if (score <= 35) return 'conservative';
    if (score <= 65) return 'balanced';
    return 'aggressive';
  }

  private getProfileDescription(profile: string): string {
    const descriptions: Record<string, string> = {
      conservative:
        'You prefer stable, low-risk investments. Your portfolio will focus on government bonds, Sukuk, and the savings vault.',
      balanced:
        'You seek a mix of growth and stability. Your portfolio will blend BRVM equities with bonds and Sukuk.',
      aggressive:
        'You are comfortable with higher risk for higher returns. Your portfolio will emphasize BRVM equities with diversified support from bonds.',
    };
    return descriptions[profile] || '';
  }
}
