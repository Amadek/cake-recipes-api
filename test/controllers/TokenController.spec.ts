import request from 'supertest';
import express, { Application } from 'express';
import { IConfig } from '../../src/IConfig';
import { TestConfig } from '../TestConfig';
import { TokenController } from '../../src/controllers/TokenController';
import { MongoClient, Db } from 'mongodb';
import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { AxiosInstance } from 'axios';
import { NotFound } from 'http-errors';

describe('TokenController', () => {
  const config: IConfig = new TestConfig();
  const app: Application = express();
  const axiosMock: MockProxy<AxiosInstance> & AxiosInstance = mock<AxiosInstance>();
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
      app.use('/token', new TokenController(db, axiosMock).route());
    })
  );

  beforeEach(() => db.collection('user').deleteMany({})
    .then(() => mockReset(axiosMock))
  );

  afterAll(() => connection.close());

  describe('PUT /token', () => {
    it('should throw Bad Request when no token', done => {
      request(app)
        .put('/token')
        .expect(400, done);
    });

    it('should return Created when valid token', done => {
      // ARRANGE
      const gitHubUser: any = { data: { Id: 'gitHubUserId' } };
      axiosMock.get.mockReturnValue(gitHubUser);
      // ACT
      request(app)
        .put('/token')
        .send({ token: 'token' })
        // ASSERT
        .expect(201)
        .then(() => db.collection('user').findOne({ accessToken: 'token' }))
        .then(user => {
          expect(user).toBeTruthy();
          expect(user.sourceUserId).toBe(gitHubUser.data.Id)
          expect(axiosMock.get).toHaveBeenCalled();
        })
        .then(done)
        .catch(done);
    });

    it('should return Not Found when not valid token', done => {
      // ARRANGE
      axiosMock.get.mockImplementation(() => { throw new NotFound(); });
      // ACT
      request(app)
        .put('/token')
        .send({ token: 'wrongToken' })
        // ASSERT
        .expect(404)
        .then(() => db.collection('user').findOne({ accessToken: 'wrongToken' }))
        .then(user => {
          expect(user).toBeNull();
          expect(axiosMock.get).toHaveBeenCalled();
        })
        .then(done)
        .catch(done);
    });
  });
});
