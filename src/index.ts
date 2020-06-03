import express, { Application } from 'express';
import { RecipeController } from './controllers/RecipeController';
import { NotFound } from 'http-errors';
import { IConfig } from './IConfig';
import { Config } from './Config';
import { DbConnector } from './DbConnector';
import { DbInitializer } from './DbInitializer';
import Axios, { AxiosInstance } from 'axios';
import { RecipeParser } from './controllers/RecipeParser';
import { AuthController } from './controllers/AuthController';
import { IJwtManager } from './controllers/IJwtManager';
import { JwtManagerHS256 } from './controllers/JwtManagerHS256';

const app: Application = express();
const config: IConfig = new Config();
const axios: AxiosInstance = Axios.create();
const jwtManager: IJwtManager = new JwtManagerHS256(config);

Promise.resolve()
  .then(() => new DbConnector(config).connect())
  .then(db => new DbInitializer(db).initialize())
  .then(db => {
    app.use(express.json());
    app.use('/auth', new AuthController(axios, jwtManager, config).route());
    app.use('/recipe', new RecipeController(jwtManager, new RecipeParser(), db).route());
    // Any other route should throw Not Found.
    app.use((_req, _res, next) => next(new NotFound()));
    app.listen(config.port, () => console.log(`Listening on ${config.port}...`));
  });
