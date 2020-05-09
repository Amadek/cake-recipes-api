FROM node:lts-alpine

ADD . /app

WORKDIR /app

RUN npm install

RUN npm run build

USER node

CMD [ "npm", "start" ]
