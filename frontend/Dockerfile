# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Install deps — cached unless package*.json changes
COPY package*.json ./
RUN npm ci --prefer-offline

# 2. Copy source & build
COPY . .
RUN npm run build

# ── Stage 2: serve via nginx ─────────────────────────────────────────────────
FROM nginx:alpine

# Drop default config and drop in ours
COPY --from=builder /app/dist /usr/share/nginx/html/homefinance
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
