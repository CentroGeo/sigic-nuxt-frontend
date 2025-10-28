# 🏗️ Build stage
FROM node:22 AS builder

# Build-time arguments (usados por Nuxt en build)
ARG NODE_ENV
ARG NUXT_PUBLIC_APP_BASE_PATH
ARG NUXT_PUBLIC_AUTH_BASE_URL
ARG NUXT_PUBLIC_BASE_URL

# Set environment for build & runtime
ENV NODE_ENV=${NODE_ENV:-production}
ENV NUXT_PUBLIC_APP_BASE_PATH=${NUXT_PUBLIC_APP_BASE_PATH:-/}
ENV NUXT_PUBLIC_AUTH_BASE_URL=${NUXT_PUBLIC_AUTH_BASE_URL:-api/auth}
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL:-http://localhost:3000}


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

# --- copiar solo package.json primero ---
COPY package*.json ./

# --- limpiar npm cache ---
RUN npm cache clean --force

# --- si es submódulo, eliminar git antes de copiar el resto ---
RUN if [ "$IS_NUXT_SUBMODULE" = "true" ]; then \
      echo "⚙️  Submodule context detected — Git metadata will be stripped after copy"; \
    else \
      echo "✅ Standalone context — keeping Git metadata"; \
    fi

# --- ahora sí copiar todo el código ---
COPY . .

# --- aplicar borrado sólo si el flag está activo ---
RUN if [ "$IS_NUXT_SUBMODULE" = "true" ]; then \
      echo "🔥 Removing .git and .gitmodules"; \
      rm -rf .git .gitmodules; \
    fi

RUN npm run clean \
    && npm install --include=dev

RUN npm run build


# 🚀 Final stage
FROM node:22-slim

# Build-time arguments (usados por Nuxt en build)
ARG NODE_ENV
ARG NUXT_PUBLIC_APP_BASE_PATH
ARG NUXT_PUBLIC_AUTH_BASE_URL
ARG NUXT_PUBLIC_BASE_URL

# Set environment for build & runtime
ENV NODE_ENV=${NODE_ENV:-production}
ENV NUXT_PUBLIC_APP_BASE_PATH=${NUXT_PUBLIC_APP_BASE_PATH:-/}
ENV NUXT_PUBLIC_AUTH_BASE_URL=${NUXT_PUBLIC_AUTH_BASE_URL:-api/auth}
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL:-http://localhost:3000}

WORKDIR /app

COPY --from=builder /app/.output/ .output/

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
