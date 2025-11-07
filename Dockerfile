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

# Create non-root user for security (use host user's UID/GID for volume permissions)
# ARG can be passed from docker-compose or defaults to 1001
ARG USER_ID=1001
ARG GROUP_ID=1001

# Create group (if GID exists, skip; if not, create)
RUN if ! getent group ${GROUP_ID} > /dev/null 2>&1; then \
      groupadd --gid ${GROUP_ID} nodejs; \
    fi

# Create user (if UID exists, use that user; if not, create nextjs user)
RUN if ! getent passwd ${USER_ID} > /dev/null 2>&1; then \
      useradd --uid ${USER_ID} --gid ${GROUP_ID} --no-create-home --shell /bin/false nextjs; \
    fi

# Create necessary directories with correct permissions
RUN mkdir -p /app/uploads /app/outputs /app/test-cli-outputs /app/logs && \
    chown -R ${USER_ID}:${GROUP_ID} /app

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

# Copy necessary runtime files
COPY scripts ./scripts
COPY templates ./templates

# Fix ownership of all files
RUN chown -R ${USER_ID}:${GROUP_ID} /app

# Switch to non-root user
USER ${USER_ID}:${GROUP_ID}

# Expose Next.js port
EXPOSE 3001

# Set environment variables
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
