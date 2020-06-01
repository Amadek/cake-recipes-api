import { IConfig } from "./IConfig";

/**
 * Configuration containing constants and environement variables.
 */
export class Config implements IConfig {
  /** @inheritdoc */
  get port (): number { return parseInt(process.env.PORT as string, 10); }

  /** @inheritdoc */
  get mongoUrl (): string { return process.env.MONGO_URL as string; }

  /** @inheritdoc */
  get mongoDbName (): string { return process.env.MONGO_DB_NAME as string; }

  /** @inheritdoc */
  get gitHubClientSecret () { return process.env.GITHUB_CLIENT_SECRET as string; }
}