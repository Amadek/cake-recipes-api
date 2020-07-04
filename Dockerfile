FROM node

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
