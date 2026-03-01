FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html/homefinance

# Copy custom nginx config if necessary, or use default
# Here we add a basic config to support React Router
RUN echo 'server { \
    listen 80; \
    location /homefinance { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /homefinance/index.html; \
    } \
    location / { \
        return 301 /homefinance; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
