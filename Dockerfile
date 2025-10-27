# 🏗️ Build stage
FROM node:22 AS builder

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-production}

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

# 🔧 Romper herencia de submódulo solo si se especifica
ARG IS_NUXT_SUBMODULE
RUN if [ "$IS_NUXT_SUBMODULE" = "true" ]; then \
      echo "⚙️  Removing Git metadata (submodule context detected)"; \
      rm -rf .git .gitmodules; \
    else \
      echo "✅ Keeping Git metadata (standalone mode)"; \
    fi

RUN touch package-lock.json  \
    && npm cache clean --force \
    && rm -rf package-lock.json  \
    && npm install git+https://github.com/CentroGeo/sisdai-mapas.git#fix/wms-fetch --save \
    && npm install --include=dev

RUN npm run build


# 🚀 Final stage
FROM node:22-slim

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-production}

WORKDIR /app

COPY --from=builder /app/.output/ .output/

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
