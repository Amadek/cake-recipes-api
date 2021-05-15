import { Db } from 'mongodb';
import { Config } from './Config';

/** Initializes db with required values. */
export class DbInitializer {

  public constructor (private readonly _db: Db, private readonly _config: Config) { }

  public initialize (): Promise<Db> {
    return Promise.resolve()
      // Put requeired values to the db here.
      .then(() => this._db.collection('permission').countDocuments({ userId: this._config.adminGithubId }, { limit: 1 }))
      .then(userCount => {
        if (userCount === 0) return this._db.collection('permission').insertOne({ userId: this._config.adminGithubId })
      })
      .then(() => this._db);
  }
}
