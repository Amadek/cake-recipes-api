import { Db } from 'mongodb';

/** Initializes db with required values. */
export class DbInitializer {

  public constructor (private readonly _db: Db) { }

  public initialize (): Promise<Db> {
    return Promise.resolve()
      // Put requeired values to the db here.
      .then(() => this._db);
  }
}
