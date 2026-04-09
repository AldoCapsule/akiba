# =============================================================================
# Akiba API — Multi-stage Docker Build
# =============================================================================
# Produces a minimal production image (~150 MB) with only the compiled
# JavaScript and production dependencies.
#
# Build:   docker build -t akiba-api .
# Run:     docker run -p 4000:4000 --env-file .env akiba-api
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
# We use a full Node image here because some native modules (e.g. bcrypt)
# need build tools that aren't available in Alpine.
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy only the files pnpm needs to resolve and install dependencies.
# This layer is cached unless package.json or lockfile changes.
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2: Build the NestJS application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

# ---------------------------------------------------------------------------
# Stage 3: Production image
# ---------------------------------------------------------------------------
# Lean Alpine image — no build tools, no devDependencies, no source code.
FROM node:20-alpine AS runner

# Non-root user for security
RUN addgroup --system --gid 1001 akiba && \
    adduser --system --uid 1001 --ingroup akiba akiba

WORKDIR /app

# Copy compiled output and production dependencies
COPY --from=builder --chown=akiba:akiba /app/dist ./dist
COPY --from=deps    --chown=akiba:akiba /app/node_modules ./node_modules
COPY --from=builder --chown=akiba:akiba /app/package.json ./package.json

USER akiba

EXPOSE 4000

# Use node directly (not pnpm/npm) — fewer processes, cleaner signal handling
CMD ["node", "dist/main.js"]
