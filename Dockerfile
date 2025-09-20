# 🏗️ Build stage
FROM node:22 AS builder

# Usa NODE_ENV para determinar si es dev o prod
ARG NODE_ENV
ARG NUXT_PUBLIC_BASE_URL
ENV NODE_ENV=${NODE_ENV:-development}
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

COPY . .

RUN touch package-lock.json && rm -rf package-lock.json

RUN npm install

RUN npm run build


# 🚀 Final stage
FROM node:22-slim

# Usa NODE_ENV para determinar si es dev o prod
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-development}
ARG NUXT_PUBLIC_BASE_URL
ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL:-http://localhost:3000}

WORKDIR /app

COPY --from=builder /app/.output/ .output/
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/.npmrc .npmrc

RUN apt-get update && \
    apt-get install -y --no-install-recommends git openssh-client && \
    rm -rf /var/lib/apt/lists/* && \
    if [ "$NODE_ENV" = "development" ]; then \
        echo "NODE_ENV is development"; \
        npm ci --omit=dev; \
    elif [ "$NODE_ENV" = "production" ]; then \
        echo "NODE_ENV is production"; \
        npm ci --omit=dev; \
    else \
        echo "NODE_ENV must be either 'development' or 'production'" && exit 1; \
    fi

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
