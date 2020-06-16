FROM node

ADD . /app

WORKDIR /app

RUN npm install && npm run compile

USER node

CMD [ "./run.sh" ]
