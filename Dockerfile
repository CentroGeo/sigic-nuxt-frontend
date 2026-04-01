# 🏗️ Build stage
FROM node:22 AS builder

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
RUN npm install --include=dev --legacy-peer-deps \
    && npm cache clean --force

# --- copiar el código ---
COPY . .

# compilar la aplicación
RUN npm run build  \
    && mv .output/ build_output \
    && npm run clean \
    && mv build_output/ .output/


# 🚀 Final stage
FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/.output/ .output/

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
