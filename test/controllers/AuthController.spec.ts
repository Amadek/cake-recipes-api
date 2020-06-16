import request from 'supertest';
import express, { Application } from 'express';
import { IConfig } from '../../src/IConfig';
import { TestConfig } from '../TestConfig';
import { AuthController } from '../../src/controllers/AuthController';
import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { AxiosInstance } from 'axios';
import { NotFound } from 'http-errors';
import { IJwtManager } from '../../src/controllers/IJwtManager';

describe('AuthController', () => {
  const config: IConfig = new TestConfig();
  const app: Application = express();
  const axiosMock: MockProxy<AxiosInstance> & AxiosInstance = mock<AxiosInstance>();
  const jwtManagerMock: MockProxy<IJwtManager> & IJwtManager = mock<IJwtManager>();

  beforeAll(() => {
    app.use(express.json());
    app.use('/auth', new AuthController(axiosMock, jwtManagerMock, config).route());
  });

  beforeEach(() => {
    mockReset(axiosMock);
  });

  describe('GET /auth', () => {
    it('should throw Bad Request when wrong client_id', done => {
      request(app)
        .get('/auth')
        .query({ client_id: '' })
        .expect(400, done);
    });

    it('should throw Bad Request when wrong redirect_url', done => {
      request(app)
        .get('/auth')
        .query({ client_id: 'clientId', redirect_url: '' })
        .expect(400, done);
    });

    it('should return Redirected when valid client_id and redirect_url', done => {
      // ARRANGE
      axiosMock.getUri.mockReturnValue('uri');

      // ACT
      request(app)
        .get('/auth')
        .query({ client_id: 'clientId', redirect_url: 'redirectUrl' })
        // ASSERT
        .expect(302, done);
    });
  });

  describe('GET /auth/redirect', () => {
    it('should throw Bad Request when invalid client_id', done => {
      request(app)
        .get('/auth/redirect')
        .query({ client_id: '' })
        .expect(400, done);
    });

    it('should throw Bad Request when invalid request token', done => {
      request(app)
        .get('/auth/redirect')
        .query({ client_id: 'clientId', requestToken: '' })
        .expect(400, done);
    });

    it('should throw Bad Request when invalid redirect_url', done => {
      request(app)
        .get('/auth/redirect')
        .query({ client_id: 'clientId', requestToken: 'requestToken', redirect_url: '' })
        .expect(400, done);
    });

    it('should return NotFound when GitHub is saying request token is wrong', done => {
      // ARRANGE
      axiosMock.post.mockImplementation(() => { throw new NotFound(); });

      // ACT
      request(app)
        .get('/auth/redirect')
        .query({ client_id: 'clientId', code: 'wrongRequestToken', redirect_url: 'redirectUrl' })
        // ASSERT
        .expect(404)
        .then(() => {
          expect(axiosMock.post).toBeCalled();
        })
        .then(done);
    });

    it('should return Found (redirect) when client_id and token are valid', done => {
      // ARRANGE
      const gitHubUser: any = { data: { id: 'gitHubUserId' } };
      axiosMock.post.mockReturnValue(Promise.resolve({ data: { access_token: 'accessToken' } }));
      axiosMock.get.mockReturnValue(gitHubUser);
      jwtManagerMock.create.mockReturnValue('header.payload.sign');
      // ACT
      request(app)
        .get('/auth/redirect')
        .query({ client_id: 'clientId', code: 'requestToken', redirect_url: 'redirectUrl' })
        // ASSERT
        .expect(302)
        .then(res => {
          expect(axiosMock.post).toBeCalled();
          expect(axiosMock.get).toBeCalled();
          expect(jwtManagerMock.create).toBeCalled();
          expect(jwtManagerMock.create).toBeCalledWith(gitHubUser.data.id, 'accessToken');
        })
        .then(done);
    });
  });
});
