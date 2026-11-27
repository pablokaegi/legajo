FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends espeak-ng ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && install -d -o node -g node -m 0700 /var/legajo-demo /uploads
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY build/ ./build/
COPY drizzle/ ./drizzle/
COPY scripts/migrate.mjs ./scripts/migrate.mjs
COPY deploy/demo/legajo-init.mjs ./legajo-init.mjs
USER node
EXPOSE 3000
CMD ["node","--env-file=/run/alere-demo/moodle.env","build/index.js"]
