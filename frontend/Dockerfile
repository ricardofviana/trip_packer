FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN npm install

# Copy source code
COPY . .

# Copy the appropriate environment file for Docker builds
COPY .env.docker .env

# Set environment variable and build the application
RUN echo "VITE_API_PROXY_TARGET: $VITE_API_PROXY_TARGET" && VITE_DEBUG=true npm run build:docker

EXPOSE 8080

CMD ["npm", "run", "dev"]