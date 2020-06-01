import express, { Router, Request, Response, NextFunction } from 'express';
import { AxiosInstance } from 'axios';
import { BadRequest } from 'http-errors';
import { KJUR } from 'jsrsasign';
import { IConfig } from '../IConfig';

export class AuthController {
  public constructor (private readonly _axios: AxiosInstance, private readonly _config: IConfig) { }

  public route (): Router {
    const router: Router = express.Router();
    router.get('/', this.getAuth.bind(this));
    router.get('/redirect', this.getAuthRedirect.bind(this));
    return router;
  }

  public getAuth (req: Request, res: Response): void {
    if (typeof req.query.client_id !== 'string') throw new BadRequest();

    let redirectUri: string = this._axios.getUri({
      method: 'GET',
      url: this._getBaseUrl(req) + '/redirect',
      params: { client_id: req.query.client_id }
    });

    redirectUri = 'http://' + redirectUri;

    console.log(redirectUri);

    const url: string = this._axios.getUri({
      method: 'GET',
      url: 'https://github.com/login/oauth/authorize',
      params: {
        client_id: req.query.client_id,
        redirect_uri: redirectUri
      }
    });

    res.redirect(url);
  }

  public getAuthRedirect (req: Request, res: Response, next: NextFunction): void {
    // If code aka request token not provided, throw Bad Request.
    if (typeof req.query.client_id !== 'string' || typeof req.query.code !== 'string') throw new BadRequest();

    const clientId: string = req.query.client_id;
    const requestToken: string = req.query.code;

    Promise.resolve()
      .then(() => this._getAccessToken(clientId, requestToken))
      .then(accessToken => this.createJsonWebToken(accessToken))
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

  private createJsonWebToken (accessToken: string): Promise<string> {
    return Promise.resolve()
      .then(() => this._axios.get('https://api.github.com/user', {
        headers: {
          Authorization: 'token ' + accessToken,
          accept: 'application/json'
        }
      }))
      .then(gitHubUser => {
        const header: any = { alg: 'HS256' };
        const payload: any = {
          sourceUserId: gitHubUser.data.Id, // TODO this member is not included after decrypting, why?
          accessToken
        };
        const jwt: string = KJUR.jws.JWS.sign('HS256', header, payload, 'password');
        return jwt;
      });
  }

  private _getBaseUrl (req: Request): string {
    return req.headers.host + req.baseUrl;
  }
}