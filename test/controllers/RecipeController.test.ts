import { mockReset, mock, MockProxy } from 'jest-mock-extended';
import { IConfig } from '../../src/IConfig';
import { TestConfig } from '../TestConfig';
import express, { Application } from 'express';
import { MongoClient, Db, ObjectID } from 'mongodb';
import { RecipeController } from '../../src/controllers/RecipeController';
import request from 'supertest';
import { IRecipeParser } from '../../src/controllers/IRecipeParser';
import { Recipe } from '../../src/entities/Recipe';
import { IJwtManager } from '../../src/controllers/IJwtManager';
import { User } from '../../src/entities/User';
import { Permission } from '../../src/entities/Permission';

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

  beforeEach(() => {
    return Promise.resolve()
      .then(() => db.collection('permission').deleteMany({}))
      .then(() => db.collection('recipe').deleteMany({}))
      .then(() => {
        mockReset(jwtManagerMock);
        mockReset(recipeParserMock);
      });
  });

  afterAll(() => connection.close());

  describe('GET /recipe/name/:recipeName', () => {
    it('should get recipes', done => {
      // ARRANGE
      const recipe1: Recipe = {
        description: 'recipeDescription',
        howTo: 'recipeHowTo',
        name: 'recipeName1',
        ownerId: 1,
        suplements: []
      };

      const recipe2: Recipe = {
        description: 'recipeDescription',
        howTo: 'recipeHowTo',
        name: 'recipeName2',
        ownerId: 1,
        suplements: []
      };

      db.collection('recipe').insertMany([ recipe1, recipe2 ])
        // ACT
        .then(() => request(app).get('/recipe/name/Name').expect(200))
        // ASSERT
        .then(res => {
          expect(res.body.length).toBe(2);
        })
        .then(() => done());
    });
  });

  describe('GET /recipe/id/:recipeId', () => {
    it('should get recipe by Id', done => {
      // ARRANGE
      const recipe: Recipe = {
        description: 'recipeDescription',
        howTo: 'recipeHowTo',
        name: 'recipeName1',
        ownerId: 1,
        suplements: []
      };

      db.collection('recipe').insertOne(recipe)
        // ACT
        .then(({ insertedId }) => request(app).get(`/recipe/id/${insertedId}`).expect(200))
        // ASSERT
        .then(res => {
          expect(res.body.name).toBe(recipe.name);
        })
        .then(() => done());
    });

    it('should return NotFound when recipe with provided Id not exists', done => {
      request(app)
        .get(`/recipe/id/${new ObjectID().toHexString()}`)
        .expect(404)
        .then(() => done());
    });
  });

  describe('POST /recipe', () => {
    it('should return Unauthorized when provided jwt is not valid', done => {
      // ARRANGE
      jwtManagerMock.parse.mockReturnValue(null);
      // ACT
      request(app)
        .post('/recipe')
        .set('Authorization', 'Bearer wrongJwt')
        // ASSERT
        .expect(401)
        .then(() => {
          expect(jwtManagerMock.parse).toBeCalled();
        })
        .then(() => done());
    });

    it('should return Unauthorized when Authorization header not included', done => {
      // ARRANGE
      jwtManagerMock.parse.mockReturnValue(null);
      // ACT
      request(app)
        .post('/recipe')
        // ASSERT
        .expect(401)
        .then(() => {
          expect(jwtManagerMock.parse).not.toBeCalled();
        })
        .then(() => done());
    });

    it('should return BadRequest when recipe not parsed', done => {
      // ARRANGE
      const user: User = { id: 1, accessToken: 'accessToken' };
      const permission: Permission = { userId: user.id };

      jwtManagerMock.parse.mockReturnValue(user);
      recipeParserMock.parse.mockReturnValue(null);
      // ACT
      Promise.resolve()
        .then(() => db.collection('permission').insertOne(permission))
        .then(() => request(app)
          .post('/recipe')
          .set('Authorization', 'Bearer jwt')
          // ASSERT
          .expect(400)
        )
        .then(() => {
          expect(jwtManagerMock.parse).toBeCalled();
          expect(recipeParserMock.parse).toBeCalled();
        })
        .then(() => done());
    });

    it('should return Created when recipe parsed and added to DB', done => {
      // ARRANGE
      const user: User = { id: 1, accessToken: 'accessToken' };
      const permission: Permission = { userId: user.id };
      const recipe: Recipe = {
        name: 'name',
        description: 'description',
        howTo: 'howTo',
        suplements: ['suplement']
      };

      jwtManagerMock.parse.mockReturnValue(user);
      recipeParserMock.parse.mockReturnValue(recipe);

      Promise.resolve()
      .then(() => db.collection('permission').insertOne(permission))
        // ACT
        .then(() => request(app)
          .post('/recipe')
          .set('Authorization', 'Bearer jwt')
          // ASSERT
          .expect(201)
        )
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
        .then(() => done());
    });
  });

  describe('PATCH /recipe', () => {
    it('should update recipe', done => {
      // ARRANGE
      const user: User = { id: 1, accessToken: 'accessToken' };
      const permission: Permission = { userId: user.id };
      const recipe: Recipe = {
        description: 'recipeDescription',
        howTo: 'recipeHowTo',
        name: 'recipeName1',
        ownerId: 1,
        suplements: []
      };

      jwtManagerMock.parse.mockReturnValue(user);
      recipeParserMock.parse.mockReturnValue(recipe);

      Promise.resolve()
        .then(() => db.collection('permission').insertOne(permission))
        .then(() => db.collection('recipe').insertOne(recipe))
        .then(({ insertedId }) => {
          const updatedRecipe: Recipe = {
            _id: insertedId,
            description: 'recipeDescription',
            howTo: 'recipeHowTo',
            name: 'recipeName1',
            ownerId: 1,
            suplements: []
          };
          return updatedRecipe;
        })
        // ACT, ASSERT
        .then(updatedRecipe => request(app)
          .patch(`/recipe`)
          .set('Authorization', 'Bearer jwt')
          .send(updatedRecipe)
          .expect(200)
        )
        .then(() => done());
    });

    it('should need permissions', done => {
      // ARRANGE
      const user: User = { id: 1, accessToken: 'accessToken' };
      jwtManagerMock.parse.mockReturnValue(user);

      const recipe: Recipe = {
        description: 'recipeDescription',
        howTo: 'recipeHowTo',
        name: 'recipeName1',
        ownerId: 1,
        suplements: []
      };

      Promise.resolve()
        .then(() => db.collection('recipe').insertOne(recipe))
        .then(({ insertedId }) => {
          const updatedRecipe: Recipe = {
            _id: insertedId,
            description: 'recipeDescription',
            howTo: 'recipeHowTo',
            name: 'recipeName1',
            ownerId: 1,
            suplements: []
          };
          return updatedRecipe;
        })
        // ACT, ASSERT
        .then(updatedRecipe => request(app)
          .patch(`/recipe`)
          .set('Authorization', 'Bearer jwt')
          .send(updatedRecipe)
          .expect(403)
          .then(() => done())
        );
    });
  });
});
