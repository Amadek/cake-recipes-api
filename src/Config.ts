import { IConfig } from "./IConfig";

/**
 * Configuration containing constants and environement variables.
 */
export class Config implements IConfig {
  /** @inheritdoc */
  get port (): number { return parseInt(process.env.PORT as string ?? 4000, 10); }

  /** @inheritdoc */
  get mongoUrl (): string { return process.env.MONGO_URL as string ?? 'mongodb://localhost:27017'; }

  /** @inheritdoc */
  get mongoDbName (): string { return process.env.MONGO_DB_NAME as string ?? 'CakeRecipes'; }

  /** @inheritdoc */
  get gitHubClientSecret () { return process.env.GITHUB_CLIENT_SECRET as string ?? '*****'; }

  /** @inheritdoc */
  get jwtSignPassword () { return process.env.JWT_SIGN_PASSWORD as string ?? '*****'; }

  /** @inheritdoc */
  get adminGithubId () { return parseInt(process.env.ADMIN_GITHUB_ID as string ?? -1); }
}
