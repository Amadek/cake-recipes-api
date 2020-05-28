
/**
 * Configuration containing constants and environement variables.
 */
export class Config {
  /** Api listening port. */
  get port (): number { return 3000; }

  /** Mongo connection Url. */
  get mongoUrl (): string { return 'mongodb://recipes-mongo:27017'; }

  /** Mongo database name. */
  get mongoDbName (): string { return 'recipes'; }
}