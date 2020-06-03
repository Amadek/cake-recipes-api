import express, { Router, Request, Response, NextFunction } from 'express';
import { AxiosInstance } from 'axios';
import { BadRequest } from 'http-errors';
import { IConfig } from '../IConfig';
import { IJwtManager } from './IJwtManager';

export class AuthController {
  public constructor (private readonly _axios: AxiosInstance, private readonly _jwtManager: IJwtManager, private readonly _config: IConfig) { }

  public route (): Router {
    const router: Router = express.Router();
    router.get('/', this.getAuth.bind(this));
    router.get('/redirect', this.getAuthRedirect.bind(this));
    return router;
  }

  public getAuth (req: Request, res: Response): void {
    if (!req.query.client_id || typeof req.query.client_id !== 'string') throw new BadRequest();

    const redirectUri: string = this._axios.getUri({
      method: 'GET',
      url: this._getBaseUrl(req) + '/redirect',
      params: { client_id: req.query.client_id }
    });

    const authorizeUri: string = this._axios.getUri({
      method: 'GET',
      url: 'https://github.com/login/oauth/authorize',
      params: {
        client_id: req.query.client_id,
        redirect_uri: 'http://' + redirectUri
      }
    });

    res.redirect(authorizeUri);
  }

  public getAuthRedirect (req: Request, res: Response, next: NextFunction): void {
    // If code aka request token not provided, throw Bad Request.
    if (!req.query.client_id || typeof req.query.client_id !== 'string' || !req.query.code || typeof req.query.code !== 'string') throw new BadRequest();

    const clientId: string = req.query.client_id;
    const requestToken: string = req.query.code;

    Promise.resolve()
      .then(() => this._getAccessToken(clientId, requestToken))
      .then(accessToken => this._createJsonWebToken(accessToken))
      .then(jwt => res.status(201).send(jwt))
      .catch(next);
  }

  private _getAccessToken (clientId: string, requestToken: string): Promise<string> {
    return Promise.resolve()
      .then(() => this._axios.post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: this._config.gitHubClientSecret,
        code: requestToken
      }, {
        headers: {
          accept: 'application/json'
        }
      }))
    .then(response => response.data.access_token);
  }

  private _createJsonWebToken (accessToken: string): Promise<string> {
    return Promise.resolve()
      .then(() => this._axios.get('https://api.github.com/user', {
        headers: {
          Authorization: 'token ' + accessToken,
          accept: 'application/json'
        }
      }))
      .then(gitHubUser => this._jwtManager.create(gitHubUser.data.id, accessToken));
  }

  private _getBaseUrl (req: Request): string {
    return req.headers.host + req.baseUrl;
  }
}
