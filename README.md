# cake-recipes-api
API for cake recipes store.

## Inputs
1. PORT: number
2. MONGO_URL: url
3. MONGO_DB_NAME: string

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
npm start -e ENV=VALUE
``` 
Notify that this way only starts an API which is not useful without running database server.
If you want to run working app with single command, go to the Docker way.

npm start also requires to set up environments shown in **Inputs** section.

### Run in Docker container
If you want to deploy app to a container and run related containers on the same time, run:
```
docker-compose build
```
And when built:
```
docker-compose up
```
If you want to see changes you made, you have to every time build a container with docker-compose build.
When container builds, it installs dependencies and build an app every time from zero.

There are some environment values we cannot keep in repository such as GitHub client secret.
You need to set up by your own in docker-compose.override.yml
In docker-compose.yml you have a tip what you have to set.

## Testing
It is not required to test using docker.
Only you have to do is simply:
```
npm test
```
