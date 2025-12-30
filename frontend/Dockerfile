# ===== BUILD STAGE =====
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===== RUN STAGE =====
FROM nginx:alpine

# Copy build React sang Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 trong container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
