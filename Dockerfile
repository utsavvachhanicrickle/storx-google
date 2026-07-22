# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* are baked in at build time
ARG GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_ACCESS_API=https://www.googleapis.com/oauth2/v3/userinfo
ARG NEXT_PUBLIC_BACKEND_URL=/api/proxy/
ARG NEXT_PUBLIC_FIREBASE_CONFIG={}
ARG BACKEND_API_URL=http://localhost:10002/api/v0

ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_ACCESS_API=$NEXT_PUBLIC_GOOGLE_ACCESS_API
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_FIREBASE_CONFIG=$NEXT_PUBLIC_FIREBASE_CONFIG
ENV BACKEND_API_URL=$BACKEND_API_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Runtime: set BACKEND_API_URL to your satellite (e.g. http://satellite:10002/api/v0)
CMD ["node", "server.js"]
