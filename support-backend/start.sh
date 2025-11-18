#!/bin/sh

echo "🚀 Starting Support Backend..."

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# Run migrations
echo "📊 Running database migrations..."
npm run db:migrate

# Start the application
echo "🎯 Starting application..."
npm start
