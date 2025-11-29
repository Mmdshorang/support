# مرحله build
FROM node:20-alpine AS builder

ARG VITE_API_URL=https://support-back.liara.run/api

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# مرحله سرو با nginx
FROM nginx:alpine

# ساخت دایرکتوری‌های temp قبل از اجرای nginx
RUN mkdir -p /tmp/nginx/client_temp \
    /tmp/nginx/proxy_temp \
    /tmp/nginx/fastcgi_temp \
    /tmp/nginx/uwsgi_temp \
    /tmp/nginx/scgi_temp && \
    chmod -R 777 /tmp/nginx

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
