# ---- 1. 安装依赖 ----
FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
# 先复制 schema，确保 prisma postinstall 能找到它
COPY prisma ./prisma
RUN npm install

# ---- 2. 构建 ----
FROM node:22-slim AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
# 显式为 Debian(slim) + OpenSSL3 生成 Prisma 客户端
RUN PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x npx prisma generate
RUN npm run build

# ---- 3. 运行时 ----
FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma 客户端（standalone 不自动包含）
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
