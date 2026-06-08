# =========================
# Stage 1: Builder
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

# فعال‌سازی pnpm از طریق corepack
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# کپی فقط dependency ها برای cache بهتر
COPY package.json pnpm-lock.yaml ./
ENV PNPM_IGNORE_BUILD_DEPENDENCIES=true
# جلوگیری از خطای approve-builds در pnpm جدید
ENV PNPM_ENABLE_BUILD_DEPENDENCIES=true

# نصب کامل dependencies (حل مشکل esbuild و tailwind oxide)
RUN pnpm install --frozen-lockfile --no-verify-store-integrity

# کپی کل پروژه
COPY . .

# env برای build فرانت
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# بیلد با pnpm (نه npm!)
RUN pnpm build


# =========================
# Stage 2: Production (Nginx)
# =========================
FROM nginx:alpine

# ساخت temp dir برای nginx (حل مشکل permission در بعضی سیستم‌ها)
RUN mkdir -p /tmp/nginx/client_temp \
    /tmp/nginx/proxy_temp \
    /tmp/nginx/fastcgi_temp \
    /tmp/nginx/uwsgi_temp \
    /tmp/nginx/scgi_temp && \
    chmod -R 777 /tmp/nginx

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# خروجی build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]