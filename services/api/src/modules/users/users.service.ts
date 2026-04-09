import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
        phone: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        address: true,
        city: true,
        country: true,
        language: true,
        status: true,
        kycStatus: true,
        riskProfile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // TODO: Validate that certain fields cannot change after KYC approval (e.g. fullName, dateOfBirth)

    const user = await this.db.user.update({
      where: { id: userId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Profile updated for user ${userId}`);

    return {
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        language: user.language,
      },
    };
  }

  async submitKyc(userId: string, dto: SubmitKycDto) {
    // TODO: Validate document images are accessible
    // TODO: Submit to third-party KYC provider (e.g. Smile Identity, Onfido)
    // TODO: Create KYC record with PENDING status
    // TODO: Trigger compliance team notification

    const kyc = await this.db.kycSubmission.create({
      data: {
        userId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        documentExpiry: new Date(dto.documentExpiry),
        documentFrontUrl: dto.documentFrontUrl,
        documentBackUrl: dto.documentBackUrl,
        selfieUrl: dto.selfieUrl,
        legalName: dto.legalName,
        dateOfBirth: new Date(dto.dateOfBirth),
        nationality: dto.nationality,
        status: 'PENDING',
      },
    });

    await this.db.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    this.logger.log(`KYC submitted for user ${userId}`);

    return {
      message: 'KYC documents submitted for review',
      submissionId: kyc.id,
      status: 'PENDING',
      estimatedReviewTime: '24 hours',
    };
  }

  async getKycStatus(userId: string) {
    const submission = await this.db.kycSubmission.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        documentType: true,
        rejectionReason: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    return {
      hasSubmission: !!submission,
      submission,
    };
  }

  async submitRiskAssessment(userId: string, dto: RiskAssessmentDto) {
    // TODO: Run risk scoring algorithm
    // TODO: Map score to risk profile category (CONSERVATIVE, MODERATE, AGGRESSIVE)
    // TODO: Store assessment answers and computed profile

    const score = this.calculateRiskScore(dto);
    const profile = this.mapScoreToProfile(score);

    await this.db.riskAssessment.create({
      data: {
        userId,
        incomeRange: dto.incomeRange,
        investmentHorizon: dto.investmentHorizon,
        investmentExperience: dto.investmentExperience,
        riskTolerance: dto.riskTolerance,
        maxAcceptableLoss: dto.maxAcceptableLoss,
        computedScore: score,
        riskProfile: profile,
      },
    });

    await this.db.user.update({
      where: { id: userId },
      data: { riskProfile: profile },
    });

    this.logger.log(`Risk assessment completed for user ${userId}: ${profile}`);

    return {
      score,
      riskProfile: profile,
      message: `Your risk profile has been set to ${profile}`,
    };
  }

  async getRiskProfile(userId: string) {
    const assessment = await this.db.riskAssessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!assessment) {
      return {
        hasAssessment: false,
        message: 'No risk assessment found. Please complete the questionnaire.',
      };
    }

    return {
      hasAssessment: true,
      riskProfile: assessment.riskProfile,
      score: assessment.computedScore,
      completedAt: assessment.createdAt,
    };
  }

  async getUserById(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private calculateRiskScore(dto: RiskAssessmentDto): number {
    // TODO: Implement proper scoring algorithm
    let score = 0;

    // Income range contributes 0-25 points
    const incomeScores = {
      BELOW_100K: 5,
      FROM_100K_TO_300K: 10,
      FROM_300K_TO_1M: 18,
      ABOVE_1M: 25,
    };
    score += incomeScores[dto.incomeRange] || 0;

    // Investment horizon contributes 0-25 points
    const horizonScores = {
      SHORT_TERM: 5,
      MEDIUM_TERM: 15,
      LONG_TERM: 25,
    };
    score += horizonScores[dto.investmentHorizon] || 0;

    // Experience contributes 0-25 points
    const experienceScores = {
      NONE: 3,
      BEGINNER: 10,
      INTERMEDIATE: 18,
      ADVANCED: 25,
    };
    score += experienceScores[dto.investmentExperience] || 0;

    // Risk tolerance and max loss contribute remaining points
    score += dto.riskTolerance * 1.5;
    score += dto.maxAcceptableLoss * 0.2;

    return Math.round(Math.min(score, 100));
  }

  private mapScoreToProfile(score: number): string {
    if (score <= 30) return 'CONSERVATIVE';
    if (score <= 55) return 'MODERATE_CONSERVATIVE';
    if (score <= 70) return 'MODERATE';
    if (score <= 85) return 'MODERATE_AGGRESSIVE';
    return 'AGGRESSIVE';
  }
}
