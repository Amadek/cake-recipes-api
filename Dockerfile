FROM node:lts-alpine

ADD . /app

WORKDIR /app

RUN npm install && npm run build

USER node

CMD [ "npm", "start" ]
