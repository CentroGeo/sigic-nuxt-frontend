# 🏗️ Build stage
FROM node:22 AS builder

ARG INSTALL_DEV=true

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libc6 \
    libstdc++6 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN npm run build


# 🚀 Final stage
FROM node:22-slim

ARG INSTALL_DEV=true

WORKDIR /app

COPY --from=builder /app/.output .output
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .

RUN if [ "$INSTALL_DEV" = "true" ]; then \
      npm i; \
    else \
      npm ci --omit=dev; \
    fi

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
