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
import { IJwtManager } from '../../src/controllers/IJwtManager';
import { User } from '../../src/entities/User';

describe('RecipeController', () => {
  const config: IConfig = new TestConfig();
  const app: Application = express();
  const jwtManagerMock: MockProxy<IJwtManager> & IJwtManager = mock<IJwtManager>();
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
      app.use('/recipe', new RecipeController(jwtManagerMock, recipeParserMock, db).route());
    })
  );

  beforeEach(() => db.collection('user').deleteMany({})
    .then(() => {
      mockReset(jwtManagerMock);
      mockReset(recipeParserMock);
    })
  );

  afterAll(() => connection.close());

  describe('POST /recipe', () => {
    it('should return BadRequest when provided jwt is not valid', done => {
      // ARRANGE
      jwtManagerMock.parse.mockReturnValue(null);
      // ACT
      request(app)
        .post('/recipe')
        .set('Authorization', 'Bearer wrongJwt')
        // ASSERT
        .expect(400)
        .then(() => {
          expect(jwtManagerMock.parse).toBeCalled();
        })
        .then(done);
    });

    it('should return BadRequest when Authorization header not included', done => {
      // ARRANGE
      jwtManagerMock.parse.mockReturnValue(null);
      // ACT
      request(app)
        .post('/recipe')
        // ASSERT
        .expect(400)
        .then(() => {
          expect(jwtManagerMock.parse).not.toBeCalled();
        })
        .then(done);
    });

    it('should return BadRequest when recipe not parsed', done => {
      // ARRANGE
      jwtManagerMock.parse.mockReturnValue({ id: 'id', accessToken: 'accessToken' });
      recipeParserMock.parse.mockReturnValue(null);
      // ACT
      request(app)
        .post('/recipe')
        .set('Authorization', 'Bearer jwt')
        // ASSERT
        .expect(400)
        .then(() => {
          expect(jwtManagerMock.parse).toBeCalled();
          expect(recipeParserMock.parse).toBeCalled();
        })
        .then(done);
    });

    it('should return Created when recipe parsed and added to DB', done => {
      // ARRANGE
      const user: User = { id: 'id', accessToken: 'accessToken' };
      jwtManagerMock.parse.mockReturnValue(user);
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
        .set('Authorization', 'Bearer jwt')
        // ASSERT
        .expect(201)
        .then(res => {
          expect(res.body).toBeTruthy();
          expect(jwtManagerMock.parse).toBeCalled();
          expect(recipeParserMock.parse).toBeCalled();
          return db.collection('recipe').findOne({});
        })
        .then(recipeFromDB => {
          expect(recipeFromDB).toEqual(recipe);
          expect(recipeFromDB.ownerId).toBe(user.id);
        })
        .then(done);
    });
  });
});
