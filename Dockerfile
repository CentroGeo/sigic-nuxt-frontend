# 🏗️ Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  libc6-compat \
  libstdc++ \
  sqlite-dev

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
FROM node:22-alpine

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
