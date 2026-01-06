# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy production deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production --silent

# Copy built output
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.cjs"]