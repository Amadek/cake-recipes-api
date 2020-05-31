import { mockReset, mock, MockProxy } from 'jest-mock-extended';
import { IConfig } from '../../src/IConfig';
import { TestConfig } from '../TestConfig';
import express, { Application } from 'express';
import { MongoClient, Db } from 'mongodb';
import { RecipeController } from '../../src/controllers/RecipeController';
import { ITokenValidator } from '../../src/controllers/ITokenValidator';
import request from 'supertest';
import { IRecipeParser } from '../../src/controllers/IRecipeParser';
import { Recipe } from '../../src/entities/Recipe';

describe('RecipeController', () => {
  const config: IConfig = new TestConfig();
  const app: Application = express();
  const tokenValidatorMock: ITokenValidator & MockProxy<ITokenValidator> = mock<ITokenValidator>();
  const recipeParserMock: IRecipeParser & MockProxy<IRecipeParser> = mock<IRecipeParser>();
  let connection: MongoClient;
  let db: Db;

  beforeAll(() => MongoClient.connect(config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(conn => {
      connection = conn;
      db = connection.db();
    })
    .then(() => {
      app.use(express.json());
      app.use('/recipe', new RecipeController(tokenValidatorMock, recipeParserMock, db).route());
    })
  );

  beforeEach(() => db.collection('user').deleteMany({})
    .then(() => {
      mockReset(tokenValidatorMock);
      mockReset(recipeParserMock);
    })
  );

  afterAll(() => connection.close());

  describe('POST /recipe', () => {
    it('should return BadRequest when provided token is not valid', done => {
      // ARRANGE
      tokenValidatorMock.validate.mockReturnValue(Promise.resolve(false));
      // ACT
      request(app)
        .post('/recipe')
        .set('Authorization', 'Bearer wrongToken')
        // ASSERT
        .expect(400)
        .then(() => {
          expect(tokenValidatorMock.validate).toBeCalled()
        })
        .then(done);
    });

    it('should return BadRequest when Authorization header not included', done => {
      // ARRANGE
      tokenValidatorMock.validate.mockReturnValue(Promise.resolve(false));
      // ACT
      request(app)
        .post('/recipe')
        // ASSERT
        .expect(400)
        .then(() => {
          expect(tokenValidatorMock.validate).not.toBeCalled();
        })
        .then(done);
    });

    it('should return BadRequest when recipe not parsed', done => {
      // ARRANGE
      tokenValidatorMock.validate.mockReturnValue(Promise.resolve(true));
      recipeParserMock.parse.mockReturnValue(null);
      // ACT
      request(app)
        .post('/recipe')
        .set('Authorization', 'Bearer token')
        // ASSERT
        .expect(400)
        .then(() => {
          expect(tokenValidatorMock.validate).toBeCalled();
          expect(recipeParserMock.parse).toBeCalled();
        })
        .then(done);
    });

    it('should return Created when recipe parsed and added to DB', done => {
      // ARRANGE
      tokenValidatorMock.validate.mockReturnValue(Promise.resolve(true));
      const recipe: Recipe = {
        name: 'name',
        description: 'description',
        howTo: 'howTo',
        suplements: ['suplement']
      };
      recipeParserMock.parse.mockReturnValue(recipe);
      // ACT
      request(app)
        .post('/recipe')
        .set('Authorization', 'Bearer token')
        // ASSERT
        .expect(201)
        .then(() => {
          expect(tokenValidatorMock.validate).toBeCalled();
          expect(recipeParserMock.parse).toBeCalled();
          return db.collection('recipe').findOne({});
        })
        .then(recipeFromDB => {
          expect(recipeFromDB).toEqual(recipe);
        })
        .then(done);
    });
  });
});
