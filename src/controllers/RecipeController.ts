import express, { Router, Request, Response, NextFunction } from 'express';
import { Recipe } from '../entities/Recipe';
import { BadRequest } from 'http-errors';
import { Db } from 'mongodb';
import { RecipeParser } from './RecipeParser';
import { ITokenValidator } from './ITokenValidator';

/**
 * Controller performing CRUD operations on recipes.
 */
export class RecipeController {
  /**
   * Ctor.
   * @param _db database
   */
  public constructor (private readonly _tokenValidator: ITokenValidator, private readonly _db: Db) { }

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
    Promise.resolve()
      .then(() => this._validateToken(req))
      .then(() => this._parseRecipe(req.body))
      .then(recipe => {
        if (!recipe) throw new BadRequest();

        return this._addRecipeToDb(recipe);
      })
      .then(() => res.status(200).send('OK'))
      .catch(next);
  }

  private _parseRecipe (recipeJson: any): Recipe | null {
    return new RecipeParser(recipeJson).parse();
  }

  private _addRecipeToDb (recipe: Recipe): Promise<any> {
    return this._db.collection('recipe').insertOne(recipe);
  }

  private _validateToken (req: Request): Promise<void> {
    if (!req.headers.authorization) throw new BadRequest();

    const token = req.headers.authorization.replace('Bearer ', '');

    return Promise.resolve()
      .then(() => this._tokenValidator.validate(token))
      .then(result => {
        if (!result) throw new BadRequest();
      });
  }
}