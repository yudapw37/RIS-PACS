# ============================================
# SmartRIS V2 Frontend - Vue 3 + Vite
# Multi-stage: Build lalu serve via Nginx
# ============================================

# --- Stage 1: Build Vue App ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Argumen build-time agar API URL bisa di-inject saat docker build
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# --- Stage 2: Serve dengan Nginx ---
FROM nginx:1.25-alpine AS release

# Copy hasil build Vue ke folder Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx config untuk SPA (Vue Router history mode)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
