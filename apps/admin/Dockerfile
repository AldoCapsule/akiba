# =============================================================================
# Akiba Admin Dashboard — Multi-stage Next.js Docker Build
# =============================================================================
# Uses Next.js standalone output mode for a minimal production image.
# The standalone build bundles only the server code and required dependencies,
# producing an image that's typically ~100 MB instead of ~1 GB.
#
# Build:   docker build -t akiba-admin .
# Run:     docker run -p 3001:3001 akiba-admin
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2: Build the Next.js application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects telemetry by default — disable during builds
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# ---------------------------------------------------------------------------
# Stage 3: Production image
# ---------------------------------------------------------------------------
# Uses the Next.js standalone output which includes a minimal Node.js server.
# See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
FROM node:20-alpine AS runner

WORKDIR /app

# Non-root user for security
RUN addgroup --system --gid 1001 akiba && \
    adduser --system --uid 1001 --ingroup akiba akiba

# Copy standalone server (includes bundled node_modules)
COPY --from=builder --chown=akiba:akiba /app/.next/standalone ./

# Copy static assets — these are NOT included in standalone output
COPY --from=builder --chown=akiba:akiba /app/.next/static ./.next/static

# Copy public directory if it exists (favicon, images, etc.)
COPY --from=builder --chown=akiba:akiba /app/public ./public

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

USER akiba

EXPOSE 3001

# The standalone build outputs a server.js at the root
CMD ["node", "server.js"]
