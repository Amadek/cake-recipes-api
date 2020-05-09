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

### Run for developing
If you want to rerun the app on every change in file on save, simply:
```
npm run dev
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
