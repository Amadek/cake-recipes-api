import express, { Application } from 'express';
import { RecipeController } from './controllers/RecipeController';
import { NotFound } from 'http-errors';
import { Config } from './config';

const app: Application = express();
const config: Config = new Config();

app.use(express.json());
app.use('/recipe', new RecipeController().route());
// Any other route should throw Not Found.
app.use((_req, _res, next) => next(new NotFound()));
app.listen(config.port, () => console.log(`Listening on ${config.port}...`));
