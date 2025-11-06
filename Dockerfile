# PDFlow Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Base image with system dependencies
FROM node:20-slim AS base

# Install system dependencies for PDF processing
RUN apt-get update && apt-get install -y \
    poppler-utils \
    imagemagick \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/convert /usr/bin/magick

WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 3: Build stage
FROM base AS builder

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Build CLI
RUN npm run cli:build

# Stage 4: Production runtime
FROM base AS runner

# Set to production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create necessary directories with correct permissions
RUN mkdir -p /app/uploads /app/outputs /app/test-cli-outputs && \
    chown -R nextjs:nodejs /app

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy necessary runtime files
COPY --chown=nextjs:nodejs scripts ./scripts
COPY --chown=nextjs:nodejs templates ./templates

# Switch to non-root user
USER nextjs

# Expose Next.js port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
