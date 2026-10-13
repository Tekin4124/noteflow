FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm_config_build_from_source=true npm ci --omit=dev && npm cache clean --force
FROM node:24-bookworm-slim
WORKDIR /app
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node server.js security.js passwords.js notebook-data.js app.js style.css index.html ./
COPY --chown=node:node vendor ./vendor
USER node
ENV NODE_ENV=production
CMD ["node", "server.js"]
