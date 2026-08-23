# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install

# Build stage
FROM base AS build
COPY . .
RUN npx prisma generate
ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000
CMD ["npm", "run", "start:prod"]
