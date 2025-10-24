# ============================================
# Multi-stage Dockerfile for Next.js Production
# Optimized for size, security, and performance
# ============================================

# ============================================
# Stage 1: Dependencies
# Install production dependencies only
# ============================================
FROM node:20-alpine AS deps

# Add libc6-compat for compatibility with Next.js
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies based on lock file
# Use npm ci for reproducible builds
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# Build the Next.js application
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Set NODE_ENV to production for optimized build
ENV NODE_ENV=production

# Build the Next.js application
# The prebuild script will generate sitemaps
RUN npm run build

# ============================================
# Stage 3: Runner
# Minimal production runtime
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Copy the standalone build output
# Next.js standalone output includes only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Set runtime environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check to ensure container is healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the Next.js application
CMD ["node", "server.js"]
