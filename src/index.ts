import express, { Application } from 'express';
import { RecipeController } from './controllers/RecipeController';
import { TokenController } from './controllers/TokenController';
import { NotFound } from 'http-errors';
import { Config } from './config';
import { DbConnector } from './DbConnector';
import Axios, { AxiosInstance } from 'axios';

const app: Application = express();
const config: Config = new Config();
const axios: AxiosInstance = Axios.create();

Promise.resolve()
  .then(() => new DbConnector(config).connect())
  .then(db => {
    app.use(express.json());
    app.use('/token', new TokenController(db, axios).route());
    app.use('/recipe', new RecipeController(db).route());
    // Any other route should throw Not Found.
    app.use((_req, _res, next) => next(new NotFound()));
    app.listen(config.port, () => console.log(`Listening on ${config.port}...`));
  });
