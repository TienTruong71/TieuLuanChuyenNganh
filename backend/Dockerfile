FROM node:18-alpine

WORKDIR /app

# Cài dependencies trước (tối ưu cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ source
COPY . .

# Expose port backend
EXPOSE 5000

# Chạy server
CMD ["node", "server.js"]
