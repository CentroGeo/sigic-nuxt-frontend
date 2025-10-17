# 🏗️ Build stage
FROM node:22 AS builder

ARG NODE_ENV
ARG NUXT_APP_BASE_URL
ARG NUXT_PUBLIC_BASE_URL
ARG AUTH_BASE_URL

ENV NODE_ENV=${NODE_ENV:-production}
ENV NUXT_APP_BASE_URL=${NUXT_APP_BASE_URL:-/}
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL:-http://localhost:3000}
ENV AUTH_BASE_URL=${AUTH_BASE_URL:-api/auth}

WORKDIR /app

# Herramientas necesarias para compilar bindings nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libc6 \
    libstdc++6 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN touch package-lock.json  \
    && rm -rf package-lock.json  \
    && npm install

#    && sed -i 's|// *originEnvKey:|originEnvKey:|g' nuxt.config.ts

RUN npm run build


# 🚀 Final stage
FROM node:22-slim

ARG NODE_ENV
ARG NUXT_APP_BASE_URL
ARG NUXT_PUBLIC_BASE_URL
ARG AUTH_BASE_URL

ENV NODE_ENV=${NODE_ENV:-production}
ENV NUXT_APP_BASE_URL=${NUXT_APP_BASE_URL:-/}
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL:-http://localhost:3000}
ENV AUTH_BASE_URL=${AUTH_BASE_URL:-api/auth}

WORKDIR /app

COPY --from=builder /app/.output/ .output/

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
