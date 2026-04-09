// Re-export Prisma Client for use across all services
export { PrismaClient } from '@prisma/client';
export type * from '@prisma/client';

import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client to prevent connection exhaustion
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
