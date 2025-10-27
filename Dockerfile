# 🏗️ Build stage
FROM node:22 AS builder

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-production}

# --- declarar el flag de entorno ---
ARG IS_NUXT_SUBMODULE
ENV IS_NUXT_SUBMODULE=${IS_NUXT_SUBMODULE:-true}

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

RUN touch package-lock.json  \
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
