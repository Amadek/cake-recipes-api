import { Db } from 'mongodb';
import { User } from './entities/User';

/** Initializes db with required values. */
export class DbInitializer {

  public constructor (private readonly _db: Db) { }

  public initialize (): Promise<Db> {
    return Promise.resolve()
      .then(() => this._addGodUser())
      .then(() => this._db);
  }

  private _addGodUser (): Promise<any> {
    const godUser: User = { sourceUserId: '0'.repeat(32), accessToken: '0'.repeat(32) };

    return this._db.collection('user').findOneAndUpdate({ sourceUserId: godUser.sourceUserId }, { $set: godUser }, { upsert: true });
  }
}
