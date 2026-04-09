import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const KYC_TIER_KEY = 'requiredKycTier';

// Decorator: @RequireKycTier('tier_1')
export const RequireKycTier = (tier: string) => SetMetadata(KYC_TIER_KEY, tier);

const TIER_ORDER = ['tier_0', 'tier_1', 'tier_2', 'tier_3'];

@Injectable()
export class KycTierGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.getAllAndOverride<string>(KYC_TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTier) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const userTierIndex = TIER_ORDER.indexOf(user.kycTier);
    const requiredTierIndex = TIER_ORDER.indexOf(requiredTier);

    if (userTierIndex < requiredTierIndex) {
      throw new ForbiddenException(
        `This action requires KYC ${requiredTier}. Your current tier is ${user.kycTier}. Please verify your identity to continue.`,
      );
    }

    return true;
  }
}
