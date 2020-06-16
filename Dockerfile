FROM node

ADD . /app

WORKDIR /app

RUN npm install && npx tsc

USER node

CMD [ "./run.sh" ]
