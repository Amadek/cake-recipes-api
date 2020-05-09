import express, { Router } from 'express';
import { Recipe } from '../entities/Recipe';
import { BadRequest } from 'http-errors';
import { Db } from 'mongodb';

/**
 * Controller performing CRUD operations on recipes.
 */
export class RecipeController {
  /**
   * Initializes object.
   */
  public constructor(private readonly _db: Db) { }

  /**
   * Sets up routes for a router and returns the router.
   */
  public route(): Router {
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
  public postRecipe(req: any, res: any, next: any): void {
    Promise.resolve()
      .then(() => this._parseRecipe(req.body))
      .then(recipe => {
        if (!recipe) throw new BadRequest();

        return this._addRecipeToDb(recipe);
      })
      .then(() => res.status(200).send('OK'))
      .catch(next);
  }

  private _parseRecipe(rawRecipe: any): Recipe | null {
    if (!rawRecipe) return null;

    const isValid: boolean = !!rawRecipe.name && typeof rawRecipe.name === 'string'
      && !!rawRecipe.description && typeof rawRecipe.description === 'string'
      && !!rawRecipe.howTo && typeof rawRecipe.howTo === 'string'
      && Array.isArray(rawRecipe.suplements);

    if (!isValid) {
      return null;
    }

    return {
      name: rawRecipe.name,
      description: rawRecipe.description,
      howTo: rawRecipe.howTo,
      suplements: rawRecipe.suplements
    };
  }

  private _addRecipeToDb(recipe: Recipe): Promise<any> {
    return this._db.collection('recipe').insertOne(recipe);
  }
}