# cake-recipes-api
API for cake recipes store.

## Inputs
1. NODE_ENV: string 
2. PORT: number
3. MONGO_URL: url
4. MONGO_DB_NAME: string
5. JWT_SIGN_PASSWORD: string 
6. GITHUB_CLIENT_SECRET: string

## How to run in development?
All you have to do is:
```
npm start
``` 
If you did some change simply:
```
npm run compile
```
to compile project. Container will see changes and restart immediately.

## How to buil a docker container ready to deploy?
```
npm run build
```
If you want to run this container it's required to set up environments shown in **Inputs** section.

## How to test?
```
npm test
```
