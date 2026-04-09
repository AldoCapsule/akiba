import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface AlertQuery {
  status?: string;
  severity?: string;
  page: number;
  limit: number;
}

interface AuditLogQuery {
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

interface SanctionsScreenDto {
  fullName: string;
  dateOfBirth?: string;
  nationality?: string;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private readonly db: DatabaseService) {}

  async getAlerts(query: AlertQuery) {
    const { status, severity, page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [alerts, total] = await Promise.all([
      this.db.amlAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: { id: true, fullName: true, phone: true },
          },
        },
      }),
      this.db.amlAlert.count({ where }),
    ]);

    return {
      data: alerts,
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getAlert(alertId: string) {
    const alert = await this.db.amlAlert.findUnique({
      where: { id: alertId },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, kycStatus: true },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('AML alert not found');
    }

    // TODO: Fetch related transactions that triggered the alert
    // TODO: Fetch investigation history

    return {
      ...alert,
      relatedTransactions: [], // TODO: Populate
      investigationHistory: [], // TODO: Populate
    };
  }

  async updateAlertStatus(
    alertId: string,
    status: string,
    notes: string | undefined,
    reviewerId: string,
  ) {
    const alert = await this.db.amlAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('AML alert not found');
    }

    const updated = await this.db.amlAlert.update({
      where: { id: alertId },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewNotes: notes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // TODO: Create audit log entry for the status change
    // TODO: If ESCALATED, trigger escalation workflow (notify senior compliance officer)

    this.logger.log(`AML alert ${alertId} updated to ${status} by ${reviewerId}`);

    return {
      id: updated.id,
      status: updated.status,
      message: `Alert status updated to ${status}`,
    };
  }

  async screenSanctions(dto: SanctionsScreenDto) {
    // TODO: Integrate with sanctions screening API (e.g. Refinitiv World-Check, Dow Jones)
    // TODO: Check against BCEAO blacklist
    // TODO: Check against UN Security Council Consolidated List
    // TODO: Check against EU Consolidated Sanctions List
    // TODO: Fuzzy name matching to account for transliterations

    this.logger.log(`Sanctions screening for: ${dto.fullName}`);

    // TODO: Replace with actual screening integration
    const matches: any[] = [];

    // Record the screening for audit
    await this.db.sanctionsScreening.create({
      data: {
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        nationality: dto.nationality,
        matchCount: matches.length,
        result: matches.length > 0 ? 'POTENTIAL_MATCH' : 'CLEAR',
        matches: JSON.stringify(matches),
      },
    });

    return {
      screened: dto.fullName,
      result: matches.length > 0 ? 'POTENTIAL_MATCH' : 'CLEAR',
      matchCount: matches.length,
      matches,
      screenedAt: new Date().toISOString(),
    };
  }

  async getAuditLogs(query: AuditLogQuery) {
    const { userId, action, from, to, page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.db.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async createAuditLog(dto: AuditLogEntry) {
    const log = await this.db.auditLog.create({
      data: {
        userId: dto.userId,
        action: dto.action,
        resource: dto.resource,
        resourceId: dto.resourceId,
        details: dto.details ? JSON.stringify(dto.details) : null,
        ipAddress: dto.ipAddress,
      },
    });

    return { id: log.id };
  }

  async generateCTR(from: string, to: string) {
    // TODO: Query all transactions above 15,000,000 XOF (BCEAO CTR threshold)
    // TODO: Group by user
    // TODO: Also detect structuring (multiple transactions just below threshold)
    // TODO: Generate report in BCEAO-required format

    const threshold = 15_000_000; // 15M XOF BCEAO reporting threshold

    const transactions = await this.db.transaction.findMany({
      where: {
        amount: { gte: threshold },
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(
      `CTR generated: ${transactions.length} reportable transactions from ${from} to ${to}`,
    );

    return {
      reportType: 'CURRENCY_TRANSACTION_REPORT',
      period: { from, to },
      threshold: `${threshold.toLocaleString()} XOF`,
      transactionCount: transactions.length,
      transactions: transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        userName: t.user.fullName,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        provider: t.provider,
        date: t.createdAt,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}
