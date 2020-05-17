# cake-recipes-api
API for cake recipes store

## How to run?
### The easiest way to run with NPM
Install packages with NPM.
```
npm install
```
Then build to transpile TypScript.
```
npm build
```
And now its time to start.
```
npm start
``` 
Notify that the way only starts an API which is not useful without running database server.
If you want to run working app with single command, go to the Docker way.

### Run for developing
If you want to rerun the app on every change in file on save, simply:
```
npm run dev
```
If you want to run tests:
```
npm test
```

### Run in Docker container
If you want to deploy app to container, run:
```
docker-compose build
```
And when built:
```
docker-compose up
```
If you want to see changes you made, you have to every time build a container with docker-compose build.
When container builds, it installs dependencies and build an app every time from zero.
