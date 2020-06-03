import { User } from '../entities/User';

/** Validates, parses and creates JSON Web Token (JWT). */
export interface IJwtManager {
  create (userId: string, acessToken: string): string;
  parse (jwt: string): User | null;
}
