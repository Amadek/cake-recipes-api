import { IJwtManager } from './IJwtManager';
import { User } from '../entities/User';
import { IConfig } from "../IConfig";
import JWT from 'jsonwebtoken';

/** JSON Web Token manager using HS256. */
export class JwtManagerHS256 implements IJwtManager {
  public constructor (private readonly _config: IConfig) { }

  public create (userId: string, accessToken: string): string {
    const payload: any = { userId, accessToken };
    return JWT.sign(payload, this._config.jwtSignPassword, { algorithm: 'HS256' });
  }

  public parse (jwt: string): User | null {
    try {
      const decodedJwt: any = JWT.verify(jwt, this._config.jwtSignPassword);
      return {
        id: decodedJwt.userId,
        accessToken: decodedJwt.accessToken
      };
    } catch (err) {
      return null;
    }
  }
}
