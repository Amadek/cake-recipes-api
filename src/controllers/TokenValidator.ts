import { Db } from 'mongodb';
import { ITokenValidator } from './ITokenValidator';

/** Validates existence of user associated with provided auth token. */
export class TokenValidator implements ITokenValidator {
  constructor (private readonly _db: Db) { }

  validate (token: string): Promise<boolean> {
    if (!token) return Promise.resolve(false);

    // If count === 1, user exists and token is valid, otherwise invalid.
    // Limit: 1 assures count only to one for optimization.
    return Promise.resolve()
      .then(() => this._db.collection('user').countDocuments({ accessToken: token }, { limit: 1 }))
      .then(count => count === 1);
  }
}
