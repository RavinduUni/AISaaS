# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies needed for build steps)
RUN npm ci --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Expose the application port
EXPOSE 5000

# Start the development server
CMD [ "npm", "run", "dev" ]


# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --frozen-lockfile --omit=dev

# Copy application source from builder
COPY --from=builder /app/server.js ./
COPY --from=builder /app/configs ./configs

# Change ownership to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

# Use dumb-init as PID 1 to properly handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]
