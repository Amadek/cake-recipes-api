import { Db } from 'mongodb';
import express, { Router, Request, Response, NextFunction } from 'express';
import { BadRequest } from 'http-errors'
import { User } from '../entities/User';
import { AxiosInstance } from 'axios';

/** Controller managing OAuth access tokens. */
export class TokenController {

  public constructor (private readonly _db: Db, private readonly _axios: AxiosInstance) { }

  /**
   * Sets up routes for a router and returns the router.
   */
  public route (): Router {
    const router: Router = express.Router();
    router.put('/', this.putToken.bind(this));
    return router;
  }

  /** Adds or updates user in db based on access token. */
  public putToken (req: Request, res: Response, next: NextFunction): void {
    // If token not provided, throw 'Bad Request'.
    if (!req.query.token || typeof req.query.token !== 'string') throw new BadRequest('Access token not provided.');

    const accessToken: string = req.query.token as string;

    Promise.resolve()
      .then(() => this._getUserFromGitHub(accessToken))
      .then(user => this._updateOrAddUserInDB(user))
      // Send status 'Created'.
      .then(() => res.status(201).end())
      .catch(next);
  }

  private _getUserFromGitHub (accessToken: string): Promise<User> {
    return Promise.resolve()
      .then(() => this._axios.get('https://api.github.com/user', {
        headers: {
          Authorization: 'token ' + accessToken,
          accept: 'application/json'
        }
      }))
      .then(gitHubUser => ({ sourceUserId: gitHubUser.data.Id, accessToken }));
  }

  private _updateOrAddUserInDB (user: any): Promise<any> {
    // If user with sourceUserId exists, updates it, if not, creates it.
    return this._db.collection('user').findOneAndUpdate({ sourceUserId: user.sourceUserId }, { $set: user }, { upsert: true });
  }
}
