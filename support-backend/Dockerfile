FROM node:18-alpine

# Install tools
RUN apk add --no-cache bash postgresql-client curl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 2400

CMD ["sh", "-c", "\
  echo '🚀 Starting Support Backend...' && \
  echo '⏳ Waiting for PostgreSQL...' && \
  until PGPASSWORD=$DB_PASSWORD pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do sleep 2; done && \
  echo '✅ PostgreSQL ready!' && \
  echo '📦 Running DB setup...' && \
  npm run db:setup && \
  echo '🎯 Starting application...' && \
  npm start \
"]