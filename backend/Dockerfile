FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp and prisma
RUN apk add --no-cache openssl python3 make g++

COPY package*.json ./

# 1. Install dependencies FIRST to cache the heavy Prisma engine downloads
RUN npm install

# 2. Copy the Prisma schema and run generate
COPY prisma ./prisma/
RUN npx prisma generate

# 3. Copy the rest of the application code
COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run seed && npm start"]
