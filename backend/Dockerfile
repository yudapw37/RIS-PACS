# ============================================
# SmartRIS V2 Backend - Bun/ElysiaJS
# Multi-stage build untuk ukuran image minimal
# ============================================
FROM oven/bun:1 AS base
WORKDIR /app

# --- Stage 1: Install Dependencies ---
FROM base AS install
# Copy package files
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# --- Stage 2: Production Runtime ---
FROM base AS release
# Copy production dependencies
COPY --from=install /app/node_modules ./node_modules
# Copy source code
COPY . .

# Hapus file yang tidak diperlukan di production
RUN rm -rf .git .env .gitignore

# Expose port backend
EXPOSE 3000

# Environment defaults (di-override oleh docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Jalankan aplikasi
CMD ["bun", "run", "src/index.ts"]
