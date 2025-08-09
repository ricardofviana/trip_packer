FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

RUN npm run build:docker

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]
