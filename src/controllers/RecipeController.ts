import express, { Router, Request, Response, NextFunction } from 'express';
import { Recipe } from '../entities/Recipe';
import { BadRequest } from 'http-errors';
import { Db } from 'mongodb';
import { IRecipeParser } from './IRecipeParser';
import { IJwtManager } from './IJwtManager';
import { User } from '../entities/User';

/**
 * Controller performing CRUD operations on recipes.
 */
export class RecipeController {
  /**
   * Ctor.
   * @param _db database
   */
  public constructor (private readonly _jwtManager: IJwtManager, private readonly _recipeParser: IRecipeParser, private readonly _db: Db) { }

  /**
   * Sets up routes for a router and returns the router.
   */
  public route (): Router {
    const router: Router = express.Router();
    router.post('/', this.postRecipe.bind(this));
    return router;
  }

  /**
   * Adds recipe to db.
   * @param req request containing JSON recipe in body
   * @param res response
   * @param next express callback
   */
  public postRecipe (req: Request, res: Response, next: NextFunction): void {
    const user: User = this._parseJwt(req);
    const recipe: Recipe | null = this._parseRecipe(req.body);
    if (!recipe) throw new BadRequest();
    recipe.ownerId = user.id;

    Promise.resolve()
      .then(() => this._addRecipeToDb(recipe))
      .then(({ insertedId }) => res.status(201).send(insertedId))
      .catch(next);
  }

  private _parseRecipe (recipeJson: any): Recipe | null {
    return this._recipeParser.parse(recipeJson);
  }

  private _addRecipeToDb (recipe: Recipe | null): Promise<any> {
    if (!recipe) throw new BadRequest();

    return this._db.collection('recipe').insertOne(recipe);
  }

  private _parseJwt (req: Request): User {
    if (!req.headers.authorization) throw new BadRequest();

    const jwt = req.headers.authorization.replace('Bearer ', '');
    const user: User | null = this._jwtManager.parse(jwt);

    if (!user) throw new BadRequest();

    return user;
  }
}
