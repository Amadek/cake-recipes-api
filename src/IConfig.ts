
/**
 * Configuration containing constants and environement variables.
 */
export interface IConfig {
  /** Api listening port. */
  port: number;

  /** Mongo connection Url. */
  mongoUrl: string;

  /** Mongo database name. */
  mongoDbName: string;
}