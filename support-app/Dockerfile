# ---- Build frontend ----
FROM node:18-alpine AS builder

# مسیر API نسبی
ARG VITE_API_URL=/api

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variable for build
ENV VITE_API_URL=$VITE_API_URL

# Build frontend
RUN npm run build

# ---- Serve with Nginx ----
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
