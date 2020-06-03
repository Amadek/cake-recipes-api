
/** Validates existence of user associated with provided auth token. */
export interface ITokenValidator
{
  validate (token: string): Promise<boolean>;
}
