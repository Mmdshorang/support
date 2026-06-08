FROM node:18-alpine

# Install required tools
RUN apk add --no-cache bash postgresql-client curl

WORKDIR /app

# Copy package files
RUN corepack enable

# کپی فایل‌های dependency
COPY package.json pnpm-lock.yaml ./

# نصب دقیق وابستگی‌ها
RUN pnpm install --frozen-lockfile

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 2400

# Start application
CMD ["sh", "-c", "\
  echo '🚀 Starting Support Backend...' && \
  echo '⏳ Waiting for PostgreSQL...' && \
  until pg_isready -h \"$DB_HOST\" -p \"$DB_PORT\" -U \"$DB_USER\"; do sleep 1; done && \
  echo '✅ PostgreSQL ready!' && \
  npm run db:migrate && \
  echo '🎯 Starting application...' && \
  npm start \
"]
