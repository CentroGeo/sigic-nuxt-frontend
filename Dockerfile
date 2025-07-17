# 🏗️ Build stage
FROM node:22 AS builder

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

# Argumento para decidir si se instalan devDeps
ARG INSTALL_DEV=true

RUN if [ "$INSTALL_DEV" = "true" ]; then \
      npm ci --omit=optional ; \
    else \
      npm ci --omit=dev --omit=optional ; \
    fi

COPY . .

RUN npm run build


# 🚀 Final stage
FROM node:22

WORKDIR /app

COPY --from=builder /app/.output .output
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .

# Reinstala solo lo que necesite el entorno final
ARG INSTALL_DEV=true
RUN if [ "$INSTALL_DEV" = "true" ]; then \
      npm ci --omit=optional ; \
    else \
      npm ci --omit=dev --omit=optional ; \
    fi

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
