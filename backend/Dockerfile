# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# native build tools + openssl (Prisma needs them)
RUN apk add --no-cache openssl python3 make g++

# 1. Install deps first — this layer is cached unless package*.json changes
COPY package*.json ./
RUN npm ci --prefer-offline

# 2. Generate Prisma client — cached unless schema changes
COPY prisma ./prisma/
RUN npx prisma generate

# 3. Copy source & compile TypeScript
COPY . .
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Only the tiny runtime libs Prisma needs
RUN apk add --no-cache openssl libstdc++ libgcc

# Copy only what is needed to run — no dev deps, no source
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# db push only runs if schema changed; seed runs once on first start
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run seed && npm start"]
