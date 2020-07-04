FROM node

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

RUN ls -a

COPY . .

RUN npm run build
