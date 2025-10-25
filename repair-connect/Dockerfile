# ============================================
# Multi-stage Dockerfile for Next.js 14+ App
# Optimized for GHCR and production performance
# ============================================

# ---------- Stage 1: Dependencies ----------
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./

# Install dependencies (including dev for build)
RUN npm ci

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copy node_modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js standalone output
RUN npm run build

# ---------- Stage 3: Production Runner ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy only the minimal standalone runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start Next.js (standalone mode already includes the server)
CMD ["node", "server.js"]
