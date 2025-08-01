# 🏗️ Build stage
FROM node:22 AS builder

# Usa NODE_ENV para determinar si es dev o prod
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

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

COPY package.json package-lock.json ./

# ⚠️ npm install en lugar de ci para no romper optional deps nativas
RUN npm install

COPY . .

RUN npm run build


# 🚀 Final stage
FROM node:22-slim

# Usa NODE_ENV para determinar si es dev o prod
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY --from=builder /app/.output .output
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .

# Si estamos en desarrollo, instala todo (útil para devtools), sino solo prod deps
RUN if [ "$NODE_ENV" = "development" ]; then \
      npm i; \
    else \
      npm i --omit=dev --omit=optional; \
    fi

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
