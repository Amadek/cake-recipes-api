
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

  /** GitHub client secret for OAuth. */
  gitHubClientSecret: string;

  /** Password for signing JSON Web Tokens using for authorisation. */
  jwtSignPassword: string;
}
