import { IConfig } from '../src/IConfig';

/** Configuration for testing. */
export class TestConfig implements IConfig {
  /** @inheritdoc */
  get port (): number { throw new Error(); }

  /** @inheritdoc */
  get mongoUrl (): string { return process.env.MONGO_URL as string; }

  /** @inheritdoc */
  get mongoDbName (): string { throw new Error(); }

  /** @inheritdoc */
  get gitHubClientSecret (): string { return 'secret'; }

  /** @inheritdoc */
  get jwtSignPassword (): string { return 'password'; }
}
