import express, { Application } from 'express';
import { RecipeController } from './controllers/RecipeController';
import { TokenController } from './controllers/TokenController';
import { NotFound } from 'http-errors';
import { Config } from './config';
import { DbConnector } from './DbConnector';
import { DbInitializer } from './DbInitializer';
import Axios, { AxiosInstance } from 'axios';
import { TokenValidator } from './controllers/TokenValidator';

const app: Application = express();
const config: Config = new Config();
const axios: AxiosInstance = Axios.create();

Promise.resolve()
  .then(() => new DbConnector(config).connect())
  .then(db => new DbInitializer(db).initialize())
  .then(db => {
    app.use(express.json());
    app.use('/token', new TokenController(db, axios).route());
    app.use('/recipe', new RecipeController(new TokenValidator(db), db).route());
    // Any other route should throw Not Found.
    app.use((_req, _res, next) => next(new NotFound()));
    app.listen(config.port, () => console.log(`Listening on ${config.port}...`));
  });
