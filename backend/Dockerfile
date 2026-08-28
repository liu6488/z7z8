# Dependencies Stage
# 注意：必须用 schema.docker.prisma（postgresql provider）生成 Client，
# 否则运行时连接 postgres:// 会报 "the URL must start with file://"
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json prisma/schema.docker.prisma ./
RUN npm ci && npx prisma generate --schema schema.docker.prisma

# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production Stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
