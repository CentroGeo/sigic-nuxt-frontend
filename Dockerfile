# 🏗️ Build stage
FROM node:22 AS builder

# Build-time arguments (usados por Nuxt en build)
ARG NUXT_PUBLIC_APP_BASE_PATH
ARG NUXT_PUBLIC_AUTH_BASE_URL
ARG NUXT_PUBLIC_BASE_URL

# Set environment for build & runtime
ENV NUXT_PUBLIC_APP_BASE_PATH=${NUXT_PUBLIC_APP_BASE_PATH:-/}
ENV NUXT_PUBLIC_AUTH_BASE_URL=${NUXT_PUBLIC_AUTH_BASE_URL:-http://localhost:3000/api/auth}
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL:-http://localhost:3000}

ENV NODE_ENV=production

WORKDIR /app

# Herramientas necesarias para compilar bindings nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# --- copiar solo package.json primero ---
COPY package*.json ./

# instalar dependencias
RUN npm install --include=dev

# --- copiar el código ---
COPY . .

# compilar la aplicación
RUN npm run build  \
    && mv .output/ build_output \
    && npm run clean \
    && mv build_output/ .output/


# 🚀 Final stage
FROM node:22-slim

# Build-time arguments (usados por Nuxt en build)
ARG NUXT_PUBLIC_APP_BASE_PATH
ARG NUXT_PUBLIC_AUTH_BASE_URL
ARG NUXT_PUBLIC_BASE_URL

# Set environment for build & runtime
ENV NUXT_PUBLIC_APP_BASE_PATH=${NUXT_PUBLIC_APP_BASE_PATH:-/}
ENV NUXT_PUBLIC_AUTH_BASE_URL=${NUXT_PUBLIC_AUTH_BASE_URL:-http://localhost:3000/api/auth}
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL:-http://localhost:3000}

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/.output/ .output/

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
