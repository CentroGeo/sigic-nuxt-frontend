# 🏗️ Build stage
FROM node:22 AS builder

# Usa NODE_ENV para determinar si es dev o prod
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-development}

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

RUN npm ci

COPY . .

RUN npm run build


# 🚀 Final stage
FROM node:22-slim

# Usa NODE_ENV para determinar si es dev o prod
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-development}

WORKDIR /app

COPY --from=builder /app/.output/ .output/
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .

RUN if [ "$NODE_ENV" = "development" ]; then \
      apt-get update && \
      apt-get install -y --no-install-recommends \
        git \
        openssh-client && \
      rm -rf /var/lib/apt/lists/*; \
      npm ci; \
    else \
      npm ci --omit=dev --omit=optional; \
    fi

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
