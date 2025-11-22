# مرحله build
FROM node:20-alpine AS builder

# Build argument for API URL
# لیارا متغیرهای env را به صورت environment variables در دسترس قرار می‌دهد
# می‌توانیم از ARG با مقدار پیش‌فرض استفاده کنیم
ARG VITE_API_URL=https://tender-mendel-6y7weckrv.liara.run/api

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Set environment variable for build
# از ARG استفاده می‌کنیم که می‌تواند از build-time environment variable override شود
ENV VITE_API_URL=${VITE_API_URL}

# Build application
RUN npm run build

# مرحله سرو با nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
