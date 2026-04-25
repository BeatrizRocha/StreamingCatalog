# Base image
FROM node:20-slim AS builder

# Install OpenSSL (required for Prisma)
RUN apt-get update && apt-get install -y openssl libssl-dev

# Create app directory
WORKDIR /app

# Copy all files first (to ensure schema.prisma is available for postinstall)
COPY . .

# Install dependencies (will run postinstall: prisma generate)
RUN npm ci

# Build the app
RUN npm run build

# ---
# Production stage
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy built assets and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Start the server
CMD ["npm", "run", "start:prod"]
