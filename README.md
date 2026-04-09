# Akiba

**The first mobile-first wealth management platform that turns every CFA franc into an investment, powered by the BCEAO's instant payment infrastructure.**

Akiba democratizes investing for the 70%+ of Senegalese who use mobile money but have zero access to capital markets. Micro-investing from 500 FCFA (~$0.80), automated portfolio management, goal-based savings, and Sharia-compliant investing — all funded instantly via Wave, Orange Money, or any bank account through PI-SPI.

## Architecture

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo) + TypeScript |
| Admin Dashboard | Next.js + TailwindCSS |
| Backend API | NestJS + TypeScript |
| Database | PostgreSQL 16 (Prisma ORM) |
| Cache | Redis |
| Message Queue | RabbitMQ |
| CI/CD | GitHub Actions + Docker |

## Monorepo Structure

```
akiba/
├── apps/
│   ├── mobile/          # React Native Expo app (iOS + Android)
│   └── admin/           # Next.js admin dashboard
├── services/
│   └── api/             # NestJS API (12 modules)
├── packages/
│   ├── database/        # Prisma schema + client
│   ├── shared-types/    # TypeScript domain types
│   └── tsconfig/        # Shared TypeScript configs
├── docs/                # Architecture diagrams, design system, API reference
├── docker-compose.yml   # Local dev: PostgreSQL, Redis, RabbitMQ
└── .github/workflows/   # CI pipeline
```

## Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 10
- Docker + Docker Compose

### Setup

```bash
# Clone
git clone https://github.com/AldoCapsule/akiba.git
cd akiba

# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL, Redis, RabbitMQ)
pnpm docker:up

# Generate Prisma client + run migrations
pnpm db:generate
pnpm db:migrate

# Start all services in dev mode
pnpm dev
```

### Services

| Service | URL |
|---------|-----|
| API Server | http://localhost:4000 |
| Swagger Docs | http://localhost:4000/docs |
| Admin Dashboard | http://localhost:3000 |
| RabbitMQ Management | http://localhost:15672 |

## API Modules

| Module | Description |
|--------|-------------|
| Auth | Phone + OTP registration, PIN login, JWT tokens |
| Users | Profile management, progressive KYC (4 tiers) |
| Payments | PI-SPI deposits/withdrawals, webhook handling, double-entry ledger |
| Portfolios | Robo-advisor with 6 allocation profiles (3 standard + 3 halal) |
| Investments | Trade execution, fractional shares, batch orders to partner SGI |
| Savings | Goal-based savings, recurring deposits, savings vault |
| Markets | BRVM asset catalog, price history, indices |
| Education | Financial literacy courses, quizzes, badges, gamification |
| Notifications | Push (Firebase), SMS (Africa's Talking), in-app |
| Compliance | AML/CFT monitoring, sanctions screening, STR filing to CENTIF |
| Admin | KYC review queue, user management, reporting |

## Documentation

- [Architecture Diagram](docs/architecture.md)
- [Database ERD](docs/database-erd.md)
- [Payment Flow (PI-SPI)](docs/payment-flow.md)
- [User Onboarding Flow](docs/onboarding-flow.md)
- [Design System](docs/design-system.md)
- [API Reference](docs/api-reference.md)

## Regulatory Framework

- **BCEAO** — Central bank (banking, EMI licensing, PI-SPI)
- **CREPMF** — Securities regulator (BRVM, investment advisory)
- **CENTIF** — Financial Intelligence Unit (AML/CFT, STR filing)

## License

Proprietary — All rights reserved.
