# ---- Build frontend ----
FROM node:18-alpine AS builder

ARG VITE_API_URL=http://support-backend:2400/api
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Serve with Nginx ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
