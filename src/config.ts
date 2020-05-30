import { IConfig } from "./IConfig";

/**
 * Configuration containing constants and environement variables.
 */
export class Config implements IConfig {
  /** @inheritdoc */
  get port (): number { return 3000; }

  /** @inheritdoc */
  get mongoUrl (): string { return 'mongodb://recipes-mongo:27017'; }

  /** @inheritdoc */
  get mongoDbName (): string { return 'recipes'; }
}