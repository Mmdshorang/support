FROM node:18-alpine

# Install required tools
RUN apk add --no-cache wget postgresql-client bash

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for migrations)
RUN npm ci

# Copy application code
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 2400

# Start application with migration
CMD ["./start.sh"]
