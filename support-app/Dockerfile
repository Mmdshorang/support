# مرحله build
FROM node:20-alpine AS builder

ARG VITE_API_URL=/api

WORKDIR /app

RUN corepack enable

# مهم: فعال کردن pnpm
RUN corepack prepare pnpm@latest --activate

# اول فقط فایل‌های dependency
COPY package.json pnpm-lock.yaml ./

# حالا pnpm قابل استفاده است
RUN pnpm install --frozen-lockfile

COPY . .

ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---- Serve with Nginx ----
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
