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

# Set environment variable and build the application
# RUN VITE_DEBUG=true npm run build:docker

EXPOSE 8080

CMD ["npm", "run", "dev"]