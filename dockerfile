# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app

# Copy only dependency manifests first (better layer cache)
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build NestJS
RUN npm run build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed to run
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

# Run compiled app
CMD ["node", "dist/main.js"]
