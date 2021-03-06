import { MongoClient, Db } from 'mongodb';
import { IConfig } from './IConfig';

/**
 * Connects to Db based on config and returns it.
 */
export class DbConnector {
  private readonly _mongoClient: MongoClient;
  /**
   * Initializes object.
   * @param _config configuration
   */
  public constructor (private readonly _config: IConfig) {
    this._mongoClient = new MongoClient(this._config.mongoUrl, { useUnifiedTopology: true });
  }

  /**
   * Connects to DB and returns it.
   */
  public connect (): Promise<Db> {
    return Promise.resolve()
      .then(() => this._mongoClient.connect())
      .then(client => client.db(this._config.mongoDbName));
  }
}