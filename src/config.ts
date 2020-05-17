
/**
 * Configuration containing constants and environement variables.
 */
export class Config {
  /** Api listening port. */
  get port () { return 3000; }

  /** Mongo connection Url. */
  get mongoUrl () { return 'mongodb://recipes-mongo:27017'; }

  /** Mongo database name. */
  get mongoDbName () { return 'recipes'; }
}