FROM node

ADD . /app

WORKDIR /app

RUN npm install

RUN npm run build

USER node

CMD [ "npm", "start" ]
